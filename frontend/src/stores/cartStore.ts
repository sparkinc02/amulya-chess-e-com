import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  category: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  shipping: () => number;
  gst: () => number;
  grandTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return { items: state.items.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
      }
      return { items: [...state.items, { ...product, qty: 1 }] };
    }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQty: (id, qty) =>
    set((state) => ({
      items: qty <= 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
    })),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
  shipping: () => (get().subtotal() >= 999 ? 0 : 99),
  gst: () => Math.round(get().subtotal() * 0.18),
  grandTotal: () => get().subtotal() + get().shipping() + get().gst(),
}));
