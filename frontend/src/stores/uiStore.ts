import { create } from 'zustand';

interface UIStore {
  cartOpen: boolean;
  checkoutOpen: boolean;
  activeFilter: string;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setActiveFilter: (filter: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  checkoutOpen: false,
  activeFilter: 'All',
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  setCartOpen: (open) => set({ cartOpen: open }),
  openCheckout: () => set({ checkoutOpen: true, cartOpen: false }),
  closeCheckout: () => set({ checkoutOpen: false }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
