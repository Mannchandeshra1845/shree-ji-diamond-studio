import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { computeTotals } from "@/lib/order";
import { inr, useProducts } from "@/lib/products";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — SHREE JI" },
      { name: "description", content: "Review the jewellery in your SHREE JI bag." },
      { property: "og:title", content: "Your Bag — SHREE JI" },
      { property: "og:description", content: "Review the jewellery in your SHREE JI bag." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { cart } = useStore();
  const { products, isLoading } = useProducts();
  const lines = cart.flatMap((i) => {
    const p = products.find((x) => x.slug === i.slug);
    return p ? [{ ...i, p }] : [];
  });
  const { subtotal, discount, total } = computeTotals(lines.map((l) => ({ price: l.p.price, qty: l.qty })));

  if (isLoading && cart.length > 0) {
    return <p className="py-24 text-center font-serif text-muted-foreground">Loading your bag…</p>;
  }

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
      <h1 className="mb-8 text-center font-serif text-3xl tracking-[0.12em]">YOUR BAG</h1>
      <ul className="divide-y divide-border">
        {lines.map(({ p, qty }) => (
          <li key={p.slug} className="flex gap-4 py-4">
            <img src={p.image} alt={p.name} className="h-24 w-24 rounded-xl object-cover" />
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between gap-2">
                <Link to="/product/$slug" params={{ slug: p.slug }} className="font-serif text-lg leading-tight">{p.name}</Link>
                <button aria-label="Remove" onClick={() => actions.setQty(p.slug, 0)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-full border border-border">
                  <button aria-label="Decrease" className="p-2" onClick={() => actions.setQty(p.slug, qty - 1)}><Minus className="h-4 w-4" /></button>
                  <span className="w-6 text-center">{qty}</span>
                  <button aria-label="Increase" className="p-2" onClick={() => actions.setQty(p.slug, qty + 1)}><Plus className="h-4 w-4" /></button>
                </div>
                <span className="font-semibold">{inr(p.price * qty)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-2 rounded-3xl bg-cream p-6">
        <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-badge"><span>5% off (above ₹1500)</span><span>-{inr(discount)}</span></div>}
        <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
        <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold"><span>Total</span><span>{inr(total)}</span></div>
      </div>
      <Link
        to="/checkout"
        className="mt-6 grid h-14 w-full place-items-center rounded-full bg-primary font-serif uppercase tracking-[0.15em] text-primary-foreground"
      >
        Checkout
      </Link>
    </div>
  );
}
