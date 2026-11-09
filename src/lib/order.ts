import { inr } from "./products";

export type OrderLine = { slug: string; name: string; price: number; qty: number };

/** 5% off when the subtotal is ₹1500 or more. Shipping is free. */
export function computeTotals(lines: { price: number; qty: number }[]) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = subtotal >= 1500 ? Math.round(subtotal * 0.05) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

/** Turns a typed phone number into the digits WhatsApp needs (adds 91 for 10-digit Indian numbers). */
export function whatsappDigits(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
}

export type OrderMessageInput = {
  orderNo: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
};

export function orderMessage(o: OrderMessageInput) {
  const items = o.lines.map((l, i) => `${i + 1}. ${l.name} x ${l.qty} = ${inr(l.price * l.qty)}`).join("\n");
  return [
    `*New Order #${o.orderNo} - SHREE JI*`,
    "",
    items,
    "",
    `Subtotal: ${inr(o.subtotal)}`,
    ...(o.discount > 0 ? [`Discount: -${inr(o.discount)}`] : []),
    `*Total: ${inr(o.total)}*`,
    "",
    `Name: ${o.name}`,
    `Phone: ${o.phone}`,
    `Address: ${o.address}, ${o.city}, ${o.state} - ${o.pincode}`,
    ...(o.notes ? [`Note: ${o.notes}`] : []),
  ].join("\n");
}

export function whatsappLink(storeNumber: string, message: string) {
  const n = whatsappDigits(storeNumber);
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
