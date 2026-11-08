import { useSyncExternalStore } from "react";

export type CartItem = { slug: string; qty: number };
type State = { cart: CartItem[]; wishlist: string[] };

const KEY = "shreeji-store";
const empty: State = { cart: [], wishlist: [] };
let state: State = empty;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    state = empty;
  }
}

function set(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useStore() {
  return useSyncExternalStore(subscribe, () => state, () => empty);
}

export const actions = {
  addToCart(slug: string, qty = 1) {
    const found = state.cart.find((i) => i.slug === slug);
    const cart = found
      ? state.cart.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
      : [...state.cart, { slug, qty }];
    set({ ...state, cart });
  },
  setQty(slug: string, qty: number) {
    const cart = qty <= 0 ? state.cart.filter((i) => i.slug !== slug) : state.cart.map((i) => (i.slug === slug ? { ...i, qty } : i));
    set({ ...state, cart });
  },
  toggleWish(slug: string) {
    const wishlist = state.wishlist.includes(slug) ? state.wishlist.filter((s) => s !== slug) : [...state.wishlist, slug];
    set({ ...state, wishlist });
  },
  clearCart() {
    set({ ...state, cart: [] });
  },
};
