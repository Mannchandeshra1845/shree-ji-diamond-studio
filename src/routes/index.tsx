import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Droplets, Feather, Gem, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import heroBangles from "@/assets/hero-bangles.jpg";
import heroModel from "@/assets/hero-model.jpg";
import heroCuff from "@/assets/p-cuff.jpg";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHREE JI — Anti-Tarnish 18k Gold Plated Jewellery" },
      { name: "description", content: "Shop SHREE JI anti-tarnish, waterproof, hypoallergenic 18k gold plated bands, earrings, necklaces and more." },
      { property: "og:title", content: "SHREE JI — Anti-Tarnish 18k Gold Plated Jewellery" },
      { property: "og:description", content: "Everyday gold jewellery that never tarnishes. Sale live now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SLIDES = [
  { img: heroBangles, title: "SALE LIVE NOW", sub: "100% Anti-Tarnish • Waterproof • 18k Gold Plated", cta: "Shop the sale" },
  { img: heroModel, title: "SHINE FOREVER", sub: "Anti-tarnish certified gold jewellery. Designed to shine every day.", cta: "Shop now" },
  { img: heroCuff, title: "NEW ARRIVALS", sub: "Fresh styles just dropped. Made for everyday wear.", cta: "Explore" },
];

const FEATURES = [
  { icon: ShieldCheck, label: "Anti-Tarnish" },
  { icon: Droplets, label: "Waterproof" },
  { icon: Feather, label: "Hypoallergenic" },
  { icon: Gem, label: "18k Gold Plated" },
];

const CONFIDENCE = [
  { icon: ShieldCheck, title: "Skin Safe", text: "Our jewellery is hypoallergenic and skin-safe, crafted with care to ensure comfort for all skin types. Enjoy beautiful, irritation-free wear every day, knowing each piece is designed with your well-being in mind." },
  { icon: Droplets, title: "Waterproof", text: "Shower in it, swim in it, sweat in it. Our pieces are built to handle real life without losing their shine." },
  { icon: RotateCcw, title: "Easy Returns", text: "Not in love? Reach out to us and we'll help you with a simple, hassle-free return or exchange." },
];

const REVIEWS = [
  { name: "Priya S.", text: "Hey! I received my order. The quality is impressive, such a lovely collection. Perfect for daily wear, each piece is so eye-catching. Definitely worth recommending!" },
  { name: "Ritika M.", text: "I was sorting my jewellery today and collected all the pieces I've bought from you. Months later they still look brand new!" },
  { name: "Neha P.", text: "Wore my bangle in the shower and at the beach — zero tarnish. Obsessed!" },
];

function Index() {
  const [i, setI] = useState(0);
  const [tab, setTab] = useState("All");
  const [c, setC] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const tabs = ["All", ...CATEGORIES.map((x) => x.name)];
  const list = tab === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === tab);
  const conf = CONFIDENCE[c] as (typeof CONFIDENCE)[number];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[540px] overflow-hidden md:h-[640px]">
        {SLIDES.map((s, idx) => (
          <div key={s.title} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}>
            <img src={s.img} alt={s.title} width={1024} height={1280} className="h-full w-full object-cover" />
            <div className="hero-overlay absolute inset-0" />
            <div className="absolute inset-x-0 bottom-20 px-6 text-center text-primary-foreground">
              <p className="text-sm font-medium uppercase tracking-[0.3em]">Shree Ji Exclusive</p>
              <h1 className="mt-3 text-[2.6rem] font-bold leading-tight tracking-wide md:text-6xl">{s.title}</h1>
              <p className="mx-auto mt-3 max-w-md text-base">{s.sub}</p>
              <Link to="/shop" className="mt-6 inline-block border border-primary-foreground px-8 py-3 text-sm uppercase tracking-[0.3em]">
                {s.cta}
              </Link>
            </div>
          </div>
        ))}
        <button aria-label="Previous" onClick={() => setI((i - 1 + SLIDES.length) % SLIDES.length)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-foreground/70 text-primary-foreground">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button aria-label="Next" onClick={() => setI((i + 1) % SLIDES.length)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-foreground/70 text-primary-foreground">
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
          {SLIDES.map((s, idx) => (
            <button key={s.title} aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-2.5 w-2.5 rounded-full ${idx === i ? "bg-primary-foreground" : "bg-primary-foreground/50"}`} />
          ))}
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden bg-ink py-3 text-ink-foreground">
        <div className="animate-marquee flex w-max whitespace-nowrap text-sm uppercase tracking-[0.2em]">
          {Array.from({ length: 4 }).map((_, k) => (
            <span key={k} className="px-4">New Arrivals Just Dropped &nbsp;|&nbsp; Flat 5% off on your first order above ₹1500 &nbsp;|</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto grid max-w-4xl grid-cols-4 gap-2 border-b border-border px-3 py-6">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-cream text-gold">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium md:text-sm">{label}</span>
          </div>
        ))}
      </section>

      {/* Curated collections */}
      <section className="py-12">
        <h2 className="mb-8 text-center font-serif text-3xl tracking-[0.12em]">CURATED COLLECTIONS</h2>
        <div className="no-scrollbar overflow-x-auto px-4">
          <div className="mx-auto grid w-max grid-flow-col grid-rows-2 gap-x-5 gap-y-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} to="/shop" search={{ cat: cat.name }} className="flex w-24 flex-col items-center text-center md:w-32">
                <img src={cat.image} alt={cat.name} loading="lazy" className="h-24 w-24 rounded-full object-cover shadow-md md:h-32 md:w-32" />
                <span className="mt-3 font-serif text-sm leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top styles */}
      <section className="mx-auto max-w-6xl pb-12">
        <h2 className="mb-6 text-center font-serif text-3xl tracking-[0.12em]">TOP STYLES</h2>
        <div className="no-scrollbar mb-8 flex gap-3 overflow-x-auto px-4">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 border px-6 py-3 font-serif text-xs uppercase tracking-[0.2em] ${tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 md:grid-cols-4">
          {list.slice(0, 8).map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/shop" className="inline-block border-2 border-primary px-12 py-3 font-serif uppercase tracking-[0.12em]">
            View all
          </Link>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-cream py-14">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="font-serif text-sm tracking-[0.3em] text-gold">THE PHILOSOPHY</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">EVERYDAY GOLD.</h2>
          <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
            Fine jewellery designed for real life. Sweat in it, shower in it, live in it. Our anti-tarnish 18k gold pieces are crafted to shine as long as you do, so you never have to take them off.
          </p>
        </div>
        <div className="no-scrollbar mt-10 flex snap-x gap-4 overflow-x-auto px-6">
          {PRODUCTS.slice(0, 6).map((p) => (
            <div key={p.slug} className="w-64 shrink-0 snap-start">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Loved by you */}
      <section className="py-14">
        <h2 className="mb-8 text-center font-serif text-3xl tracking-[0.12em]">LOVED BY YOU</h2>
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="w-72 shrink-0 snap-start rounded-3xl bg-ink p-6 text-ink-foreground">
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">“{r.text}”</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ink-muted">— {r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop with confidence */}
      <section className="bg-muted px-6 py-14 text-center">
        <h2 className="text-2xl font-medium tracking-[0.2em]">SHOP WITH CONFIDENCE</h2>
        <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3">
          <button aria-label="Previous" onClick={() => setC((c - 1 + CONFIDENCE.length) % CONFIDENCE.length)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-ink-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <conf.icon className="mx-auto h-12 w-12" strokeWidth={1.5} />
            <h3 className="mt-4 text-xl font-medium tracking-[0.15em] uppercase">{conf.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{conf.text}</p>
          </div>
          <button aria-label="Next" onClick={() => setC((c + 1) % CONFIDENCE.length)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-ink-foreground">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
