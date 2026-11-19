import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Place } from "./types";

type CartState = {
  lines: CartLine[];
  coupon: string;
  introSeen: boolean;
  add: (variantId: number, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  setCoupon: (coupon: string) => void;
  setLines: (lines: CartLine[]) => void;
  clear: () => void;
  dismissIntro: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      coupon: "",
      introSeen: false,
      add: (variantId, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.variantId === variantId);
          const lines = existing
            ? state.lines.map((line) =>
                line.variantId === variantId ? { ...line, qty: Math.min(20, line.qty + qty) } : line,
              )
            : [...state.lines, { variantId, qty }];
          return { lines };
        }),
      setQty: (variantId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((line) => line.variantId !== variantId)
              : state.lines.map((line) => (line.variantId === variantId ? { ...line, qty } : line)),
        })),
      setCoupon: (coupon) => set({ coupon: coupon.toUpperCase() }),
      setLines: (lines) => set({ lines }),
      clear: () => set({ lines: [], coupon: "" }),
      dismissIntro: () => set({ introSeen: true }),
    }),
    { name: "mehrait-cart", skipHydration: true },
  ),
);

type PlaceState = Place & { setPlace: (place: Place) => void };

export const usePlace = create<PlaceState>()(
  persist(
    (set) => ({
      areaId: 1,
      storeId: 1,
      label: "Indiranagar",
      city: "Bengaluru",
      pincode: "560038",
      serviceable: true,
      lat: 12.9784,
      lng: 77.6408,
      setPlace: (place) => set(place),
    }),
    { name: "mehrait-place", skipHydration: true },
  ),
);
