import { Link } from "@tanstack/react-router";
import { AtSign, Grid3x3, Heart, Home, Mail, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, PRODUCTS, inr } from "@/lib/products";
import { useStore } from "@/lib/store";

export function Logo() {
  return (
    <Link to="/" className="flex flex-col items-center leading-none">
      <span className="font-serif text-2xl tracking-[0.12em] text-gold">SHREE JI</span>
      <span className="mt-1 font-serif text-[9px] tracking-[0.35em] text-gold">ANTI.TARNISH</span>
    </Link>
  );
}

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const { cart } = useStore();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const results = q.trim()
    ? PRODUCTS.filter((p) => (p.name + " " + p.category).toLowerCase().includes(q.trim().toLowerCase().replace(/s$/, "")))
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button aria-label="Menu" onClick={() => setMenu(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-5">
            <button aria-label="Search" onClick={() => setSearch(true)}>
              <Search className="h-6 w-6" />
            </button>
            <Link to="/cart" aria-label="Cart" className="relative">
              <ShoppingBag className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-badge text-[10px] font-semibold text-badge-foreground">{count}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-50 flex bg-foreground/40" onClick={() => setMenu(false)}>
          <nav className="h-full w-72 overflow-y-auto bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button aria-label="Close" onClick={() => setMenu(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <ul className="space-y-4 font-serif text-lg">
              <li><Link to="/" onClick={() => setMenu(false)}>Home</Link></li>
              <li><Link to="/shop" onClick={() => setMenu(false)}>Shop All</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.name}>
                  <Link to="/shop" search={{ cat: c.name }} onClick={() => setMenu(false)} className="text-muted-foreground">{c.name}</Link>
                </li>
              ))}
              <li><Link to="/wishlist" onClick={() => setMenu(false)}>Wishlist</Link></li>
            </ul>
          </nav>
        </div>
      )}

      {search && (
        <div className="fixed inset-0 z-50 bg-foreground/50 px-4 pt-24 backdrop-blur-sm" onClick={() => setSearch(false)}>
          <div className="mx-auto max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 rounded-2xl bg-background px-5 py-4 shadow-xl">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jewellery..." className="flex-1 bg-transparent font-serif text-lg outline-none" />
              <button aria-label="Close search" onClick={() => setSearch(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            {results.length > 0 && (
              <ul className="mt-3 max-h-[60vh] overflow-y-auto rounded-2xl bg-background shadow-xl">
                {results.map((p) => (
                  <li key={p.slug} className="border-b border-border last:border-0">
                    <Link to="/product/$slug" params={{ slug: p.slug }} onClick={() => setSearch(false)} className="flex items-center gap-4 p-4">
                      <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
                      <div>
                        <p className="font-serif text-lg">{p.name}</p>
                        <p className="font-serif text-gold">{inr(p.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function BottomNav() {
  const { wishlist } = useStore();
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/shop", label: "Shop", icon: Grid3x3 },
    { to: "/wishlist", label: "Wishlist", icon: Heart },
    { to: "/account", label: "Account", icon: User },
    { to: "/cart", label: "Cart", icon: ShoppingBag },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center gap-1 py-2 font-serif text-xs text-muted-foreground"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              <span className="relative">
                <Icon className="h-6 w-6" />
                {label === "Wishlist" && wishlist.length > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-badge" />}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink px-6 py-12 text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-ink-muted">Customer Care</h4>
          <ul className="space-y-3 text-lg">
            <li>Size Guide</li>
            <li>Care Guide</li>
            <li>Contact Us</li>
            <li>Shipping &amp; Returns</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-ink-muted">Get In Touch</h4>
          <ul className="space-y-3 text-lg">
            <li className="flex items-center gap-3"><AtSign className="h-5 w-5 text-ink-muted" /> @shreeji.jewels</li>
            <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-ink-muted" /> hello@shreeji.in</li>
          </ul>
        </div>
        <div>
          <p className="font-serif text-2xl tracking-[0.12em] text-gold">SHREE JI</p>
          <p className="mt-2 text-sm text-ink-muted">100% Anti-Tarnish • Waterproof • 18k Gold Plated</p>
          <p className="mt-6 text-xs text-ink-muted">© {new Date().getFullYear()} SHREE JI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
