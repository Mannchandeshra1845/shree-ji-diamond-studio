import { queryOptions, useQuery } from "@tanstack/react-query";
import { rootRouteId, useLoaderData } from "@tanstack/react-router";
import bamboo from "@/assets/p-bamboo.jpg";
import studs from "@/assets/p-studs.jpg";
import cuff from "@/assets/p-cuff.jpg";
import necklace from "@/assets/p-necklace.jpg";
import watch from "@/assets/p-watch.jpg";
import ring from "@/assets/p-ring.jpg";
import bangles from "@/assets/hero-bangles.jpg";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  imageUrl: string;
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

// Built-in photos are stored as "asset:<name>"; uploaded photos are full links.
const ASSETS: Record<string, string> = {
  "p-bamboo": bamboo,
  "p-studs": studs,
  "p-cuff": cuff,
  "p-necklace": necklace,
  "p-watch": watch,
  "p-ring": ring,
  "hero-bangles": bangles,
};

export const resolveImage = (url: string) =>
  url.startsWith("asset:") ? (ASSETS[url.slice(6)] ?? cuff) : url || cuff;

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image_url: string;
  rating: number;
  reviews: number;
  sold_out: boolean;
  description: string;
};

export const toProduct = (r: Row): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  category: r.category,
  price: r.price,
  mrp: r.mrp,
  image: resolveImage(r.image_url),
  imageUrl: r.image_url,
  rating: r.rating,
  reviews: r.reviews,
  soldOut: r.sold_out,
  description: r.description,
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, category, price, mrp, image_url, rating, reviews, sold_out, description")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toProduct);
  },
  staleTime: 60_000,
});

export function useProducts() {
  // The root loader's copy travels from the server to the browser, so the first render matches.
  const initial = useLoaderData({ from: rootRouteId }) as Product[] | null | undefined;
  const { data, isLoading } = useQuery(initial ? { ...productsQuery, initialData: initial } : productsQuery);
  return { products: data ?? [], isLoading };
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
