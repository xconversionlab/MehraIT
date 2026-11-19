import type { Coupon } from "./types";

export function inr(paise: number) {
  const value = paise / 100;
  const whole = Math.round(value * 100) % 100 === 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: whole ? 0 : 2,
    minimumFractionDigits: whole ? 0 : 2,
  }).format(value);
}

export function discountPercent(mrp: number, price: number) {
  if (mrp <= price || mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export type QuoteLine = {
  variantId: number;
  productId: number;
  name: string;
  brand: string;
  sku: string;
  unit: string;
  qty: number;
  mrpPaise: number;
  pricePaise: number;
  taxBps: number;
  linePaise: number;
  taxPaise: number;
};

export type Quote = {
  lines: QuoteLine[];
  subtotalPaise: number;
  mrpPaise: number;
  discountPaise: number;
  deliveryPaise: number;
  taxPaise: number;
  payablePaise: number;
  couponError: string | null;
  couponCode: string | null;
};

export function quoteCart(input: {
  lines: Omit<QuoteLine, "linePaise" | "taxPaise">[];
  coupon: Coupon | null;
  deliveryFeePaise: number;
  freeAbovePaise: number;
  couponAlreadyUsed?: boolean;
}): Quote {
  const lines: QuoteLine[] = input.lines.map((line) => {
    const linePaise = line.pricePaise * line.qty;
    const taxPaise = Math.round((linePaise * line.taxBps) / (10000 + line.taxBps));
    return { ...line, linePaise, taxPaise };
  });
  const subtotalPaise = lines.reduce((s, l) => s + l.linePaise, 0);
  const mrpPaise = lines.reduce((s, l) => s + l.mrpPaise * l.qty, 0);
  const taxPaise = lines.reduce((s, l) => s + l.taxPaise, 0);
  let discountPaise = 0;
  let couponError: string | null = null;
  let couponCode: string | null = null;
  const coupon = input.coupon;
  if (coupon) {
    couponCode = coupon.code;
    if (input.couponAlreadyUsed) couponError = "You have already used this coupon.";
    else if (subtotalPaise < coupon.minSubtotalPaise) {
      couponError = `Add ${inr(coupon.minSubtotalPaise - subtotalPaise)} more to use ${coupon.code}.`;
    } else if (coupon.kind === "flat") {
      discountPaise = Math.min(coupon.amount, subtotalPaise);
    } else {
      const raw = Math.round((subtotalPaise * coupon.amount) / 100);
      discountPaise = Math.min(raw, coupon.maxDiscountPaise || raw, subtotalPaise);
    }
    if (couponError) {
      discountPaise = 0;
      couponCode = null;
    }
  }
  const after = subtotalPaise - discountPaise;
  const deliveryPaise = after <= 0 || after >= input.freeAbovePaise ? 0 : input.deliveryFeePaise;
  return {
    lines,
    subtotalPaise,
    mrpPaise,
    discountPaise,
    deliveryPaise,
    taxPaise,
    payablePaise: after + deliveryPaise,
    couponError,
    couponCode,
  };
}
