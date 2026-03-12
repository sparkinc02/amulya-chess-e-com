export const categories: Record<string, { name: string; id: string }> = {
  "chess-boards": { name: "Chess Boards", id: "chess-boards" },
  "chess-pieces": { name: "Chess Pieces", id: "chess-pieces" },
  "chess-sets": { name: "Complete Sets", id: "chess-sets" },
  "accessories": { name: "Accessories", id: "accessories" },
};

import { Settings } from "@/lib/types";

export const mockSettings: Settings = {
  general: {
    siteName: "Amulya Chess",
    siteDescription: "Premium handcrafted chess sets and accessories.",
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "en",
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlert: true,
    newOrderAlert: true,
    lowStockThreshold: 10,
  },
  shipping: {
    freeShippingThreshold: 5000,
    standardShippingRate: 150,
    expressShippingRate: 300,
  },
  tax: {
    taxRate: 18,
    taxIncluded: true,
  },
};
