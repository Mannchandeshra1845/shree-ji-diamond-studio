import { createServerFn } from "@tanstack/react-start";
import { computeTotals, type OrderLine } from "./order";

type Input = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  items: { slug: string; qty: number }[];
};

const str = (v: unknown, field: string, min: number, max: number) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (s.length < min || s.length > max) throw new Error(`Please check ${field}`);
  return s;
};

// Public: customers place orders without an account. Prices are always read from the database.
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((raw: Input): Input => {
    const phone = str(raw.phone, "phone number", 10, 15);
    if (!/^[+\d\s-]{10,15}$/.test(phone)) throw new Error("Please enter a valid phone number");
    const pincode = str(raw.pincode, "pincode", 6, 6);
    if (!/^\d{6}$/.test(pincode)) throw new Error("Please enter a 6-digit pincode");
    if (!Array.isArray(raw.items) || raw.items.length === 0 || raw.items.length > 50) throw new Error("Your bag is empty");
    const items = raw.items.map((i) => {
      const qty = Math.floor(Number(i.qty));
      if (typeof i.slug !== "string" || !i.slug || qty < 1 || qty > 20) throw new Error("Invalid bag item");
      return { slug: i.slug, qty };
    });
    const email = typeof raw.email === "string" ? raw.email.trim().slice(0, 120) : "";
    return {
      name: str(raw.name, "name", 2, 80),
      phone,
      email,
      address: str(raw.address, "address", 5, 300),
      city: str(raw.city, "city", 2, 60),
      state: str(raw.state, "state", 2, 60),
      pincode,
      notes: typeof raw.notes === "string" ? raw.notes.trim().slice(0, 300) : "",
      items,
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const slugs = data.items.map((i) => i.slug);
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("slug, name, price, sold_out")
      .in("slug", slugs);
    if (error) throw new Error("Could not load products, please try again");

    const lines: OrderLine[] = data.items.flatMap((i) => {
      const p = rows?.find((r) => r.slug === i.slug);
      return p && !p.sold_out ? [{ slug: p.slug, name: p.name, price: p.price, qty: i.qty }] : [];
    });
    if (lines.length === 0) throw new Error("These items are no longer available");
    const totals = computeTotals(lines);

    const { data: order, error: insErr } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        notes: data.notes || null,
        items: lines,
        ...totals,
      })
      .select("order_no")
      .single();
    if (insErr || !order) throw new Error("Could not save your order, please try again");

    const { data: settings } = await supabaseAdmin.from("store_settings").select("whatsapp_number").eq("id", 1).maybeSingle();

    return { orderNo: Number(order.order_no), lines, ...totals, whatsapp: settings?.whatsapp_number ?? "" };
  });
