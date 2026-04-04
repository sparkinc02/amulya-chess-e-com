import { create } from "zustand";
import { BUSINESS_CONFIG } from "@/config/business.config";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number; // Added stock for validation
  emoji?: string;
  image?: string;
  category: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  shipping: () => number;
  gst: () => number;
  grandTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: newQty } : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...product, qty: Math.min(qty, product.stock) },
        ],
      };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQty: (id, qty) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === id);
      if (!existing) return { items: state.items };
      const safeQty = Math.min(qty, existing.stock);
      return {
        items:
          safeQty <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) =>
                i.id === id ? { ...i, qty: safeQty } : i,
              ),
      };
    }),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
  shipping: () =>
    get().subtotal() >= BUSINESS_CONFIG.pricing.shippingThreshold
      ? 0
      : BUSINESS_CONFIG.pricing.shippingCost,
  gst: () =>
    Math.round(
      get().subtotal() * (BUSINESS_CONFIG.pricing.gstPercentage / 100),
    ),
  grandTotal: () => get().subtotal() + get().shipping() + get().gst(),
}));
