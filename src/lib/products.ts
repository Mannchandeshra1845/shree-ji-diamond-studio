import bamboo from "@/assets/p-bamboo.jpg";
import studs from "@/assets/p-studs.jpg";
import cuff from "@/assets/p-cuff.jpg";
import necklace from "@/assets/p-necklace.jpg";
import watch from "@/assets/p-watch.jpg";
import ring from "@/assets/p-ring.jpg";
import bangles from "@/assets/hero-bangles.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  rating: number;
  reviews: number;
  soldOut?: boolean;
  description: string;
};

export const CATEGORIES = [
  { name: "Bands (Baby Size)", image: cuff },
  { name: "Italian Charms", image: cuff },
  { name: "Watches", image: watch },
  { name: "Bands (Free Size)", image: bamboo },
  { name: "Bracelets", image: bangles },
  { name: "Earrings", image: studs },
  { name: "Necklaces", image: necklace },
  { name: "Rings", image: ring },
];

export const PRODUCTS: Product[] = [
  {
    slug: "black-bamboo-free-size",
    name: "Black Bamboo Free Size",
    category: "Bands (Free Size)",
    price: 399,
    mrp: 799,
    image: bamboo,
    rating: 5,
    reviews: 802,
    description: "A bold black enamel bangle with 18k gold plated bamboo joints. Waterproof and anti-tarnish, made to be worn every single day.",
  },
  {
    slug: "diamond-studs",
    name: "Diamond Studs",
    category: "Earrings",
    price: 299,
    mrp: 599,
    image: studs,
    rating: 5,
    reviews: 641,
    description: "Classic four-prong solitaire studs in 18k gold plating. Lightweight, hypoallergenic and perfect for daily wear.",
  },
  {
    slug: "champagne-rectangle-watch",
    name: "Champagne Rectangle Watch",
    category: "Watches",
    price: 649,
    mrp: 999,
    image: watch,
    rating: 5,
    reviews: 214,
    soldOut: true,
    description: "A petite gold link watch with a soft champagne dial. Elegant enough for evenings, easy enough for everyday.",
  },
  {
    slug: "pink-crystal-cuff",
    name: "Pink Crystal Cuff",
    category: "Bands (Baby Size)",
    price: 399,
    mrp: 799,
    image: cuff,
    rating: 5,
    reviews: 388,
    description: "An open cuff with a blush pink and a clear crystal. Adjustable, anti-tarnish and skin safe.",
  },
  {
    slug: "solitaire-drop-necklace",
    name: "Solitaire Drop Necklace",
    category: "Necklaces",
    price: 349,
    mrp: 699,
    image: necklace,
    rating: 5,
    reviews: 527,
    description: "A fine 18k gold plated chain with a single sparkling solitaire. The everyday necklace you'll never take off.",
  },
  {
    slug: "emerald-halo-ring",
    name: "Emerald Halo (Brass Ring)",
    category: "Rings",
    price: 299,
    mrp: 599,
    image: ring,
    rating: 5,
    reviews: 173,
    description: "An oval emerald-green stone in a gold plated brass setting. Adjustable fit.",
  },
  {
    slug: "royal-emerald-ring",
    name: "Royal Emerald (Brass Ring)",
    category: "Rings",
    price: 299,
    mrp: 599,
    image: ring,
    rating: 5,
    reviews: 159,
    description: "An emerald-cut green stone on a pave band. Adjustable, gold plated brass.",
  },
  {
    slug: "hammered-gold-bangles",
    name: "Hammered Gold Bangles (Set of 2)",
    category: "Bracelets",
    price: 449,
    mrp: 899,
    image: bangles,
    rating: 5,
    reviews: 296,
    description: "Two slim hammered bangles that catch the light from every angle. Waterproof and anti-tarnish.",
  },
  {
    slug: "italian-charm-cuff",
    name: "Italian Charm Cuff",
    category: "Italian Charms",
    price: 499,
    mrp: 999,
    image: cuff,
    rating: 5,
    reviews: 120,
    description: "Build your story with this Italian-style charm cuff. 18k gold plated and skin safe.",
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
