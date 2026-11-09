import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Product, inr } from "@/lib/products";
import { actions, useStore } from "@/lib/store";

export function FlatBadge({ price, className = "" }: { price: number; className?: string }) {
  return (
    <span className={`ribbon absolute left-0 top-0 z-10 bg-badge py-1.5 pl-3 pr-6 text-sm font-medium text-badge-foreground ${className}`}>
      Flat {inr(price)}
    </span>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const { wishlist } = useStore();
  const wished = wishlist.includes(p.slug);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <FlatBadge price={p.price} />
        <Link to="/product/$slug" params={{ slug: p.slug }}>
          <img src={p.image} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <button
          aria-label="Add to wishlist"
          onClick={() => actions.toggleWish(p.slug)}
          className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-badge text-badge" : ""}`} />
        </button>
        <button
          disabled={p.soldOut}
          onClick={() => {
            actions.addToCart(p.slug);
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
            toast.success(`${p.name} added to bag`, { action: { label: "View bag", onClick: () => navigate({ to: "/cart" }) } });
          }}
          className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-2 font-serif text-xs uppercase tracking-wide text-foreground shadow-sm disabled:text-muted-foreground"
        >
          {p.soldOut ? "Sold out" : added ? "Added ✓" : "Add to bag"}
        </button>
      </div>
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block pt-3 text-center">
        <h3 className="truncate px-1 font-serif text-base text-foreground">{p.name}</h3>
        <p className="mt-1 text-sm font-semibold">
          {inr(p.price)}.00 <span className="ml-1 font-normal text-muted-foreground line-through">{inr(p.mrp)}.00</span>
        </p>
      </Link>
    </div>
  );
}
