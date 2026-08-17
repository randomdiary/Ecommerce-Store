import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types";

type Item = Product & {
  quantity: number;
};

type CartState = {
  items: Item[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (p) =>
        set((state) => ({
          items: state.items.some((item) => item.id === p.id)
            ? state.items.map((item) =>
                item.id === p.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...state.items, { ...p, quantity: 1 }],
        })),

      remove: (id) =>
        set((state) => ({
          items: state.items.flatMap((item) =>
            item.id === id
              ? item.quantity > 1
                ? [{ ...item, quantity: item.quantity - 1 }]
                : []
              : [item]
          ),
        })),

      clear: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (sum, item) =>
            sum + (item.sale_price ?? item.price) * item.quantity,
          0
        ),
    }),
    {
      name: "ms-collection-cart",
    }
  )
);