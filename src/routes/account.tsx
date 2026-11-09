import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Mail, Package, User } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — SHREE JI" },
      { name: "description", content: "Your SHREE JI account, orders and wishlist." },
      { property: "og:title", content: "My Account — SHREE JI" },
      { property: "og:description", content: "Your SHREE JI account, orders and wishlist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Account,
});

function Account() {
  return (
    <div className="mx-auto max-w-md px-6 py-12 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream text-gold">
        <User className="h-9 w-9" />
      </span>
      <h1 className="mt-4 font-serif text-3xl">My Account</h1>
      <p className="mt-2 text-muted-foreground">Welcome to SHREE JI</p>
      <ul className="mt-8 divide-y divide-border rounded-3xl border border-border text-left">
        <li><Link to="/cart" className="flex items-center gap-3 p-5 font-serif"><Package className="h-5 w-5 text-gold" /> My Bag</Link></li>
        <li><Link to="/wishlist" className="flex items-center gap-3 p-5 font-serif"><Heart className="h-5 w-5 text-gold" /> Wishlist</Link></li>
        <li><a href="mailto:hello@shreeji.in" className="flex items-center gap-3 p-5 font-serif"><Mail className="h-5 w-5 text-gold" /> Contact Us</a></li>
      </ul>
      <Link to="/admin" className="mt-10 inline-block text-sm text-muted-foreground underline">Store admin login</Link>
    </div>
  );
}
