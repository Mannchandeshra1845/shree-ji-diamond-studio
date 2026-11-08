import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — SHREE JI" },
      { name: "description", content: "Your saved SHREE JI jewellery pieces." },
      { property: "og:title", content: "Wishlist — SHREE JI" },
      { property: "og:description", content: "Your saved SHREE JI jewellery pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const list = PRODUCTS.filter((p) => wishlist.includes(p.slug));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-center font-serif text-3xl tracking-[0.12em]">WISHLIST</h1>
      {list.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-muted-foreground">Tap the heart on any piece to save it here.</p>
          <Link to="/shop" className="mt-8 inline-block border-2 border-primary px-10 py-3 font-serif uppercase tracking-widest">Shop now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
