import { describe, expect, it } from "vitest";
import { computeTotals, whatsappDigits } from "@/lib/order";

describe("order totals", () => {
  it("gives no discount below ₹1500", () => {
    expect(computeTotals([{ price: 499, qty: 2 }])).toEqual({ subtotal: 998, discount: 0, total: 998 });
  });

  it("gives 5% off at ₹1500 or more", () => {
    expect(computeTotals([{ price: 500, qty: 3 }])).toEqual({ subtotal: 1500, discount: 75, total: 1425 });
  });
});

describe("whatsapp number", () => {
  it("adds India code 91 to a 10-digit number", () => {
    expect(whatsappDigits("98765 43210")).toBe("919876543210");
  });

  it("keeps a number that already has a country code", () => {
    expect(whatsappDigits("+91 98765-43210")).toBe("919876543210");
  });
});
