import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const calcTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((acc, i) => acc + i.quantity, 0),
  totalPrice: items.reduce((acc, i) => acc + i.price * i.quantity, 0),
});

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && i.size === item.size
          );
          const items = existing
            ? state.items.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...state.items, item];
          return { items, ...calcTotals(items) };
        }),

      removeItem: (id, size) =>
        set((state) => {
          const items = state.items.filter(
            (i) => !(i.id === id && i.size === size)
          );
          return { items, ...calcTotals(items) };
        }),

      updateQuantity: (id, size, quantity) =>
        set((state) => {
          const items =
            quantity <= 0
              ? state.items.filter((i) => !(i.id === id && i.size === size))
              : state.items.map((i) =>
                  i.id === id && i.size === size ? { ...i, quantity } : i
                );
          return { items, ...calcTotals(items) };
        }),

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    { name: 'styleai-cart' }
  )
);
