import { create } from 'zustand';

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';
  items: { id: number; name: string; emoji: string; category: string; price: number; qty: number }[];
  subtotal: number;
  shipping: number;
  gst: number;
  grandTotal: number;
  paymentMethod: string;
  deliveryAddress: {
    name: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    pin: string;
    phone: string;
  };
  trackingSteps: { label: string; date: string; done: boolean }[];
}

const mockOrders: Order[] = [
  {
    id: 'CC-A1B2C3',
    date: '2026-02-20',
    status: 'Delivered',
    items: [
      { id: 1, name: 'Grandmaster Rosewood Set', emoji: '♟', category: 'Chess Sets', price: 8499, qty: 1 },
      { id: 4, name: 'DGT 3000 Chess Clock', emoji: '⏱', category: 'Accessories', price: 2899, qty: 1 },
    ],
    subtotal: 11398, shipping: 0, gst: 2052, grandTotal: 13450, paymentMethod: 'UPI',
    deliveryAddress: { name: 'Arjun Mehta', address1: '42 Chess Lane', address2: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pin: '600017', phone: '+91 98765 43210' },
    trackingSteps: [
      { label: 'Order Placed', date: 'Feb 20, 2026', done: true },
      { label: 'Confirmed', date: 'Feb 20, 2026', done: true },
      { label: 'Shipped', date: 'Feb 22, 2026', done: true },
      { label: 'Delivered', date: 'Feb 25, 2026', done: true },
    ],
  },
  {
    id: 'CC-D4E5F6',
    date: '2026-02-28',
    status: 'In Transit',
    items: [
      { id: 7, name: 'My System — Nimzowitsch', emoji: '📖', category: 'Books', price: 549, qty: 2 },
    ],
    subtotal: 1098, shipping: 0, gst: 198, grandTotal: 1296, paymentMethod: 'Credit/Debit Card',
    deliveryAddress: { name: 'Arjun Mehta', address1: '42 Chess Lane', address2: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pin: '600017', phone: '+91 98765 43210' },
    trackingSteps: [
      { label: 'Order Placed', date: 'Feb 28, 2026', done: true },
      { label: 'Confirmed', date: 'Feb 28, 2026', done: true },
      { label: 'Shipped', date: 'Mar 1, 2026', done: true },
      { label: 'Out for Delivery', date: 'Expected Mar 3', done: false },
    ],
  },
  {
    id: 'CC-G7H8I9',
    date: '2026-03-01',
    status: 'Processing',
    items: [
      { id: 2, name: 'Walnut & Maple Board', emoji: '♜', category: 'Boards', price: 4299, qty: 1 },
      { id: 9, name: 'Chess Bag Deluxe', emoji: '🎒', category: 'Accessories', price: 1199, qty: 1 },
    ],
    subtotal: 5498, shipping: 0, gst: 990, grandTotal: 6488, paymentMethod: 'Cash on Delivery',
    deliveryAddress: { name: 'Arjun Mehta', address1: '42 Chess Lane', address2: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pin: '600017', phone: '+91 98765 43210' },
    trackingSteps: [
      { label: 'Order Placed', date: 'Mar 1, 2026', done: true },
      { label: 'Confirmed', date: 'Pending', done: false },
      { label: 'Shipped', date: 'Pending', done: false },
      { label: 'Delivered', date: 'Pending', done: false },
    ],
  },
];

interface OrdersStore {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersStore>((_, get) => ({
  orders: mockOrders,
  getOrder: (id) => get().orders.find((o) => o.id === id),
}));
