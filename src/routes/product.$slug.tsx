import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Award, Heart, Share2, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { useState } from "react";
import { FlatBadge, ProductCard } from "@/components/ProductCard";
import { PRODUCTS, getProduct, inr } from "@/lib/products";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — SHREE JI` : "Product not found — SHREE JI";
    const desc = p ? p.description : "This product is unavailable.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(p ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="font-serif text-2xl">Product not found</p>
      <Link to="/shop" className="mt-6 inline-block border border-primary px-8 py-3 font-serif uppercase tracking-widest">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const { wishlist } = useStore();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(p.slug);
  const off = Math.round((1 - p.price / p.mrp) * 100);
  const related = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 4);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: p.name, url }).catch(() => {});
    else await navigator.clipboard?.writeText(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:grid md:grid-cols-2 md:gap-10 md:py-10">
      <div className="relative overflow-hidden rounded-3xl bg-muted">
        <FlatBadge price={p.price} />
        <img src={p.image} alt={p.name} width={816} height={816} className="aspect-square w-full object-cover" />
        <button aria-label="Share" onClick={share} className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-background shadow">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <div className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-baseline gap-3">
              <span className="text-2xl text-muted-foreground line-through">{inr(p.mrp)}</span>
              <span className="text-4xl font-semibold">{inr(p.price)}</span>
              <span className="text-sm font-semibold text-badge">{off}% OFF</span>
            </p>
            <p className="mt-1 font-serif text-muted-foreground">Inclusive of all taxes</p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, k) => (
              <Star key={k} className="h-4 w-4 fill-foreground" />
            ))}
            <span className="ml-1 font-serif text-muted-foreground">({p.reviews})</span>
          </div>
        </div>

        <h1 className="mt-6 font-serif text-4xl">{p.name}</h1>

        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto">
          {[
            { icon: Sparkles, t: "Anti-Tarnish" },
            { icon: ShieldCheck, t: "Skin Safe Jewellery" },
            { icon: Award, t: "18K Gold Plated" },
          ].map(({ icon: Icon, t }) => (
            <span key={t} className="flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 font-serif">
              <Icon className="h-4 w-4" /> {t}
            </span>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            aria-label="Wishlist"
            onClick={() => actions.toggleWish(p.slug)}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border"
          >
            <Heart className={`h-5 w-5 ${wished ? "fill-badge text-badge" : ""}`} />
          </button>
          <button
            disabled={p.soldOut}
            onClick={() => {
              actions.addToCart(p.slug);
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
            }}
            className="h-14 flex-1 rounded-full border-2 border-primary font-serif uppercase tracking-[0.15em] disabled:opacity-50"
          >
            {p.soldOut ? "Sold out" : added ? "Added ✓" : "Add to bag"}
          </button>
          <button
            disabled={p.soldOut}
            onClick={() => {
              actions.addToCart(p.slug);
              navigate({ to: "/cart" });
            }}
            className="h-14 flex-1 rounded-full bg-primary font-serif uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
          >
            Buy now
          </button>
        </div>

        <div className="mt-8 rounded-3xl border border-border p-6">
          <h2 className="font-serif text-xl">Description</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{p.description}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• 100% anti-tarnish & waterproof</li>
            <li>• Hypoallergenic, nickel-free</li>
            <li>• 18k gold plated stainless steel</li>
          </ul>
          <p className="mt-5 flex items-center gap-2 text-sm"><Truck className="h-4 w-4 text-gold" /> Free shipping on prepaid orders</p>
        </div>
      </div>

      <section className="col-span-2 py-12">
        <h2 className="mb-6 text-center font-serif text-2xl tracking-[0.12em]">YOU MAY ALSO LIKE</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {related.map((r) => (
            <ProductCard key={r.slug} p={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
