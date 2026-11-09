import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, useProducts } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): { cat?: string } => {
    const cat = s["cat"];
    return typeof cat === "string" ? { cat } : {};
  },
  head: () => ({
    meta: [
      { title: "Shop All Jewellery — SHREE JI" },
      { name: "description", content: "Browse all SHREE JI anti-tarnish bands, bracelets, earrings, necklaces, rings and watches." },
      { property: "og:title", content: "Shop All Jewellery — SHREE JI" },
      { property: "og:description", content: "Anti-tarnish, waterproof 18k gold plated jewellery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { cat } = Route.useSearch();
  const { products: PRODUCTS } = useProducts();
  const list = cat ? PRODUCTS.filter((p) => p.category === cat) : PRODUCTS;
  const chip = (active: boolean) =>
    `shrink-0 border px-5 py-2.5 font-serif text-xs uppercase tracking-[0.2em] ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`;

  return (
    <div className="mx-auto max-w-6xl py-10">
      <h1 className="mb-6 text-center font-serif text-3xl tracking-[0.12em]">{cat ? cat.toUpperCase() : "SHOP ALL"}</h1>
      <div className="no-scrollbar mb-8 flex gap-3 overflow-x-auto px-4">
        <Link to="/shop" className={chip(!cat)}>All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.name} to="/shop" search={{ cat: c.name }} className={chip(cat === c.name)}>
            {c.name}
          </Link>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-20 text-center font-serif text-muted-foreground">New pieces coming soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 md:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
