export const categories: Record<string, { name: string; id: string; subcategories: string[] }> = {
  "chess-set": {
    name: "CHESS SET",
    id: "chess-set",
    subcategories: [
      "Standard Chess Set",
      "Premium Chess Set",
      "Magnetic Chess Set Small",
      "Magnetic Chess Set Big",
      "Pocket Chess Set",
    ],
  },
  "chess-bags": {
    name: "CHESS BAGS",
    id: "chess-bags",
    subcategories: [
      "Coins Pouch",
      "Coins Pouch Premium",
      "Kit Bag",
      "Kit Bag Premium",
    ],
  },
  "chess-clock": {
    name: "CHESS CLOCK",
    id: "chess-clock",
    subcategories: [
      "DGT 2010",
      "DGT 2500",
      "DGT 3000",
      "DGT 3000 Limited Edition",
      "DGT Starter Box (with Clock)",
    ],
  },
  "chess-accessories": {
    name: "CHESS ACCESSORIES",
    id: "chess-accessories",
    subcategories: [
      "6 piece tiny chess keychain",
      "Chess scorebook (100 games)",
      "Chess scorebook tiny",
      "T Shirts",
      "Chess Board Silicon Keychain",
    ],
  },
  "beginner-books": {
    name: "BEGINNER BOOKS",
    id: "beginner-books",
    subcategories: [
      "Mate in 1, 2, 3 (4 vol each)",
      "Mate in 4 (1800 puzzles)",
      "Chess Course by Santhanam",
      "Chess Course by Zaveri",
      "Chess Course for Schools",
      "Chess Course (Set of 7 books)",
    ],
  },
  "middlegame-endgame-books": {
    name: "MIDDLEGAME & ENDGAME BOOKS",
    id: "middlegame-endgame-books",
    subcategories: [
      "Endless Endings",
      "Kamikaze!",
      "Zee Boom Bah!",
      "Chess Tips",
      "600 plus tactics",
    ],
  },
  "v-subramanian-books": {
    name: "V SUBRAMANIAN BOOKS",
    id: "v-subramanian-books",
    subcategories: [
      "Slav ~ Grunfeld ~ Nimzo Indian ~ French",
      "Ruy Lopez ~ Pirc ~ Carokann ~ Endgames",
    ],
  },
  "rb-ramesh-books": {
    name: "RB RAMESH BOOKS",
    id: "rb-ramesh-books",
    subcategories: [
      "Beginner to Master workbook series Vol 1 & 2",
      "Fundamental chess - Logical decision making",
      "Improve your Chess Calculation",
    ],
  },
  "demo-boards": {
    name: "DEMO BOARDS",
    id: "demo-boards",
    subcategories: ["2 fold demo board", "8 fold demo board"],
  },
  "chess-rental-service": {
    name: "CHESS RENTAL SERVICE",
    id: "chess-rental-service",
    subcategories: ["Chess Set per day", "Chess Clocks per day"],
  },
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
