import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUSES, whatsappDigits, type OrderLine } from "@/lib/order";
import { CATEGORIES, inr, productsQuery, useProducts, type Product } from "@/lib/products";

type Tab = "overview" | "orders" | "products" | "settings";

const ordersQuery = {
  queryKey: ["admin-orders"],
  queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

const input = "h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-ring";

export function AdminDashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Admin</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <button onClick={onSignOut} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-5 py-2 font-serif text-sm ${tab === t.id ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "overview" && <Overview />}
        {tab === "orders" && <Orders />}
        {tab === "products" && <Products />}
        {tab === "settings" && <Settings />}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}

function Overview() {
  const { data: orders = [], isLoading } = useQuery(ordersQuery);
  const { products } = useProducts();
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const valid = orders.filter((o) => o.status !== "cancelled");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const sold = new Map<string, { qty: number; amount: number }>();
  valid.forEach((o) =>
    (o.items as unknown as OrderLine[]).forEach((l) => {
      const cur = sold.get(l.name) ?? { qty: 0, amount: 0 };
      sold.set(l.name, { qty: cur.qty + l.qty, amount: cur.amount + l.qty * l.price });
    }),
  );
  const itemsSold = [...sold.values()].reduce((s, v) => s + v.qty, 0);
  const top = [...sold.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Total sales" value={inr(revenue)} />
        <Stat label="Orders" value={valid.length} />
        <Stat label="Items sold" value={itemsSold} />
        <Stat label="New orders" value={orders.filter((o) => o.status === "new").length} />
        <Stat label="Today" value={todayOrders} />
        <Stat label="Products" value={products.length} />
      </div>
      <div>
        <h2 className="mb-3 font-serif text-xl">What's selling</h2>
        {top.length === 0 ? (
          <p className="text-muted-foreground">No sales yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {top.map(([name, v]) => (
              <li key={name} className="flex justify-between gap-3 p-4">
                <span className="font-serif">{name}</span>
                <span className="whitespace-nowrap text-sm">{v.qty} sold · {inr(v.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Orders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery(ordersQuery);
  const [filter, setFilter] = useState("all");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-orders"] });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };
  const remove = async (id: string, no: number) => {
    if (!confirm(`Delete order #${no}?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full px-4 py-1.5 text-sm capitalize ${filter === s ? "bg-foreground text-background" : "border border-border"}`}>
            {s} ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
      <ul className="space-y-4">
        {list.map((o) => (
          <li key={o.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-serif text-lg">#{o.order_no} · {o.customer_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
              </div>
              <p className="font-semibold">{inr(o.total)}</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {(o.items as unknown as OrderLine[]).map((l) => (
                <li key={l.slug}>{l.name} × {l.qty} — {inr(l.price * l.qty)}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              {o.phone}{o.email ? ` · ${o.email}` : ""}<br />
              {o.address}, {o.city}, {o.state} - {o.pincode}
              {o.notes ? <><br />Note: {o.notes}</> : null}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="h-10 rounded-full border border-input bg-background px-3 text-sm capitalize">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <a href={`https://wa.me/${whatsappDigits(o.phone)}`} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-1 rounded-full bg-whatsapp px-4 text-sm text-whatsapp-foreground">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <button aria-label="Delete order" onClick={() => remove(o.id, o.order_no)} className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const slugify = (s: string) =>
  `${s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50)}-${Math.random().toString(36).slice(2, 6)}`;

function Products() {
  const qc = useQueryClient();
  const { products } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [formKey, setFormKey] = useState(0);
  const refresh = () => qc.invalidateQueries({ queryKey: productsQuery.queryKey });

  const save = useMutation({
    mutationFn: async (f: FormData) => {
      const file = f.get("image") as File | null;
      let image_url = editing?.imageUrl ?? "";
      if (file && file.size > 0) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const up = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        const signed = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signed.error) throw signed.error;
        image_url = signed.data.signedUrl;
      }
      if (!image_url) throw new Error("Please choose a photo");
      const row = {
        name: String(f.get("name")).trim(),
        category: String(f.get("category")),
        price: Number(f.get("price")),
        mrp: Number(f.get("mrp")),
        description: String(f.get("description") ?? "").trim(),
        sold_out: f.get("sold_out") === "on",
        image_url,
      };
      const res = editing
        ? await supabase.from("products").update(row).eq("id", editing.id)
        : await supabase.from("products").insert({ ...row, slug: slugify(row.name) });
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product added");
      setEditing(null);
      setFormKey((k) => k + 1);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    save.mutate(new FormData(e.currentTarget));
  };

  const remove = async (p: Product) => {
    if (!confirm(`Remove "${p.name}" from the store?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Product removed");
      refresh();
    }
  };

  const toggleSold = async (p: Product) => {
    const { error } = await supabase.from("products").update({ sold_out: !p.soldOut }).eq("id", p.id);
    if (error) toast.error(error.message);
    else refresh();
  };

  return (
    <div className="grid gap-8 md:grid-cols-[360px_1fr]">
      <form key={`${formKey}-${editing?.id ?? "new"}`} onSubmit={onSubmit} className="h-fit space-y-3 rounded-2xl border border-border p-4">
        <h2 className="font-serif text-xl">{editing ? "Edit product" : "Add product"}</h2>
        <input name="name" required maxLength={100} placeholder="Product name" defaultValue={editing?.name} className={input} />
        <select name="category" defaultValue={editing?.category ?? CATEGORIES[0]?.name} className={input}>
          {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input name="price" type="number" min={0} required placeholder="Price ₹" defaultValue={editing?.price} className={input} />
          <input name="mrp" type="number" min={0} required placeholder="MRP ₹" defaultValue={editing?.mrp} className={input} />
        </div>
        <textarea name="description" rows={3} maxLength={600} placeholder="Description" defaultValue={editing?.description} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-ring" />
        <label className="block text-sm text-muted-foreground">
          Photo {editing && "(leave empty to keep current)"}
          <input name="image" type="file" accept="image/*" required={!editing} className="mt-1 block w-full text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="sold_out" type="checkbox" defaultChecked={editing?.soldOut} /> Sold out
        </label>
        <button disabled={save.isPending} className="h-11 w-full rounded-full bg-primary font-serif uppercase tracking-widest text-primary-foreground disabled:opacity-60">
          {save.isPending ? "Saving…" : editing ? "Save changes" : "Add product"}
        </button>
        {editing && <button type="button" onClick={() => setEditing(null)} className="w-full text-sm text-muted-foreground underline">Cancel edit</button>}
      </form>

      <ul className="divide-y divide-border rounded-2xl border border-border">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 p-3">
            <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif">{p.name}</p>
              <p className="text-sm text-muted-foreground">{inr(p.price)} · {p.category}</p>
              <button onClick={() => toggleSold(p)} className={`mt-1 text-xs underline ${p.soldOut ? "text-badge" : "text-muted-foreground"}`}>
                {p.soldOut ? "Sold out (tap to mark in stock)" : "In stock (tap to mark sold out)"}
              </button>
            </div>
            <button aria-label="Edit" onClick={() => { setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="grid h-10 w-10 place-items-center rounded-full border border-border">
              <Pencil className="h-4 w-4" />
            </button>
            <button aria-label="Remove" onClick={() => remove(p)} className="grid h-10 w-10 place-items-center rounded-full border border-border">
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Settings() {
  const { data, refetch } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("whatsapp_number").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = String(new FormData(e.currentTarget).get("whatsapp") ?? "").trim();
    if (whatsappDigits(n).length < 11) {
      toast.error("Enter a full WhatsApp number");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("store_settings").update({ whatsapp_number: n, updated_at: new Date().toISOString() }).eq("id", 1);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("WhatsApp number saved");
      refetch();
    }
  };
  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3 rounded-2xl border border-border p-4">
      <h2 className="font-serif text-xl">Order WhatsApp number</h2>
      <p className="text-sm text-muted-foreground">Customers send their orders to this number after checkout.</p>
      <input name="whatsapp" type="tel" required placeholder="e.g. 98765 43210" defaultValue={data.whatsapp_number} className={input} />
      <button disabled={busy} className="h-11 w-full rounded-full bg-primary font-serif uppercase tracking-widest text-primary-foreground disabled:opacity-60">
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
