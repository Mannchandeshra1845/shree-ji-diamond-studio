import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { computeTotals, orderMessage, whatsappLink } from "@/lib/order";
import { placeOrder } from "@/lib/orders.functions";
import { inr, useProducts } from "@/lib/products";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — SHREE JI" },
      { name: "description", content: "Enter your delivery details and send your SHREE JI order on WhatsApp." },
      { property: "og:title", content: "Checkout — SHREE JI" },
      { property: "og:description", content: "Enter your delivery details and send your SHREE JI order on WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const FIELDS = [
  { name: "name", label: "Full name", type: "text", auto: "name" },
  { name: "phone", label: "Phone / WhatsApp number", type: "tel", auto: "tel" },
  { name: "email", label: "Email (optional)", type: "email", auto: "email" },
  { name: "address", label: "House no., street, area", type: "text", auto: "street-address" },
  { name: "city", label: "City", type: "text", auto: "address-level2" },
  { name: "state", label: "State", type: "text", auto: "address-level1" },
  { name: "pincode", label: "Pincode", type: "text", auto: "postal-code" },
] as const;

function Checkout() {
  const { cart } = useStore();
  const { products, isLoading } = useProducts();
  const submit = useServerFn(placeOrder);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ orderNo: number; link: string } | null>(null);

  const lines = cart.flatMap((i) => {
    const p = products.find((x) => x.slug === i.slug && !x.soldOut);
    return p ? [{ slug: p.slug, name: p.name, price: p.price, qty: i.qty, image: p.image }] : [];
  });
  const totals = computeTotals(lines);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    setError("");
    try {
      const res = await submit({
        data: {
          name: f.name ?? "",
          phone: f.phone ?? "",
          email: f.email,
          address: f.address ?? "",
          city: f.city ?? "",
          state: f.state ?? "",
          pincode: f.pincode ?? "",
          notes: f.notes,
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
        },
      });
      const msg = orderMessage({
        orderNo: res.orderNo,
        name: f.name ?? "",
        phone: f.phone ?? "",
        address: f.address ?? "",
        city: f.city ?? "",
        state: f.state ?? "",
        pincode: f.pincode ?? "",
        notes: f.notes,
        lines: res.lines,
        subtotal: res.subtotal,
        discount: res.discount,
        total: res.total,
      });
      actions.clearCart();
      setDone({ orderNo: res.orderNo, link: whatsappLink(res.whatsapp, msg) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="font-serif text-3xl">Order #{done.orderNo} saved 🎉</p>
        <p className="mt-3 text-muted-foreground">One last step: tap below to send your order to us on WhatsApp. We'll confirm it there.</p>
        <a
          href={done.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex h-14 items-center justify-center gap-2 rounded-full bg-whatsapp font-serif uppercase tracking-[0.12em] text-whatsapp-foreground"
        >
          <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
        </a>
        <Link to="/shop" className="mt-6 inline-block font-serif text-muted-foreground underline">Continue shopping</Link>
      </div>
    );
  }

  if (isLoading && cart.length > 0) return <p className="py-24 text-center font-serif text-muted-foreground">Loading…</p>;

  if (lines.length === 0) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="font-serif text-3xl">Your bag is empty</p>
        <Link to="/shop" className="mt-8 inline-block border-2 border-primary px-10 py-3 font-serif uppercase tracking-widest">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-center font-serif text-3xl tracking-[0.12em]">CHECKOUT</h1>
      <div className="mb-8 space-y-3 rounded-3xl bg-cream p-5">
        {lines.map((l) => (
          <div key={l.slug} className="flex items-center gap-3">
            <img src={l.image} alt={l.name} className="h-14 w-14 rounded-xl object-cover" />
            <span className="flex-1 font-serif">{l.name} × {l.qty}</span>
            <span className="font-semibold">{inr(l.price * l.qty)}</span>
          </div>
        ))}
        {totals.discount > 0 && <div className="flex justify-between text-badge"><span>5% off (above ₹1500)</span><span>-{inr(totals.discount)}</span></div>}
        <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold"><span>Total</span><span>{inr(totals.total)}</span></div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="font-serif text-xl">Delivery details</h2>
        {FIELDS.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-sm text-muted-foreground">{f.label}</span>
            <input
              name={f.name}
              type={f.type}
              autoComplete={f.auto}
              required={f.name !== "email"}
              inputMode={f.name === "pincode" || f.name === "phone" ? "numeric" : undefined}
              maxLength={f.name === "pincode" ? 6 : 200}
              className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-ring"
            />
          </label>
        ))}
        <label className="block">
          <span className="mb-1 block text-sm text-muted-foreground">Note (optional)</span>
          <textarea name="notes" rows={2} maxLength={300} className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-ring" />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          disabled={busy}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font-serif uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Placing order…" : "Place order"}
        </button>
        <p className="text-center text-xs text-muted-foreground">Cash on delivery / payment details will be shared on WhatsApp.</p>
      </form>
    </div>
  );
}
