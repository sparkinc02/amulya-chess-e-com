export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  badge?: 'BESTSELLER' | 'SALE';
  emoji: string;
  description: string;
  rating: number;
  stars: number;
  stockCount: number;
  specs?: Record<string, string>;
}

export const products: Product[] = [
  {
    id: 1, name: 'Grandmaster Rosewood Set', category: 'Chess Sets', price: 8499, originalPrice: 10999,
    badge: 'BESTSELLER', emoji: '♟', description: 'Tournament-grade Staunton pieces in Indian rosewood', rating: 4.9, stars: 5, stockCount: 14,
    specs: { 'King Height': '95mm', 'Square Size': '55mm', 'Material': 'Indian Rosewood', 'Weight': '1.8 kg', 'Board Included': 'Yes', 'Style': 'Staunton Tournament' },
  },
  {
    id: 2, name: 'Walnut & Maple Board', category: 'Boards', price: 4299,
    emoji: '♜', description: 'Handcrafted 21-inch board, 55mm squares', rating: 4.8, stars: 5, stockCount: 8,
    specs: { 'Dimensions': '21 × 21 inches', 'Square Size': '55mm', 'Material': 'Walnut & Maple', 'Thickness': '15mm', 'Finish': 'Matte lacquer' },
  },
  {
    id: 3, name: 'Classic Staunton Pieces', category: 'Pieces', price: 3199, originalPrice: 3999,
    badge: 'SALE', emoji: '♛', description: 'Weighted felted base, triple-koah wood', rating: 4.6, stars: 4, stockCount: 22,
    specs: { 'King Height': '89mm', 'Material': 'Triple-Koah Wood', 'Weight': '1.2 kg', 'Felted Base': 'Yes', 'Style': 'Staunton' },
  },
  {
    id: 4, name: 'DGT 3000 Chess Clock', category: 'Accessories', price: 2899,
    emoji: '⏱', description: 'Official FIDE tournament clock', rating: 5.0, stars: 5, stockCount: 3,
    specs: { 'Dimensions': '16 × 7 × 4 cm', 'Display': 'Digital LCD', 'Battery': '2× AA', 'Certification': 'FIDE Approved', 'Case': 'ABS Plastic' },
  },
  {
    id: 5, name: 'Fischer Random Set', category: 'Chess Sets', price: 6799,
    emoji: '♟', description: 'Chess960 ready, maple construction', rating: 4.7, stars: 4, stockCount: 11,
    specs: { 'King Height': '90mm', 'Material': 'Maple', 'Board Included': 'Yes', 'Size': '20 × 20 inches', 'Style': 'Chess960' },
  },
  {
    id: 6, name: 'Leather Travel Board', category: 'Boards', price: 1899,
    emoji: '♜', description: 'Roll-up genuine leather, magnetic pieces included', rating: 4.5, stars: 4, stockCount: 19,
    specs: { 'Dimensions': '14 × 14 inches', 'Material': 'Genuine Leather', 'Magnetic': 'Yes', 'Portable': 'Roll-up' },
  },
  {
    id: 7, name: 'My System — Nimzowitsch', category: 'Books', price: 549,
    emoji: '📖', description: 'The timeless chess strategy classic', rating: 4.9, stars: 5, stockCount: 45,
    specs: { 'Pages': '368', 'Language': 'English', 'Author': 'Aron Nimzowitsch', 'Format': 'Paperback' },
  },
  {
    id: 8, name: 'Silicone Tournament Board', category: 'Boards', price: 1299, originalPrice: 1599,
    badge: 'SALE', emoji: '♜', description: 'FIDE approved, rollable, waterproof', rating: 4.6, stars: 4, stockCount: 0,
    specs: { 'Dimensions': '20 × 20 inches', 'Square Size': '57mm', 'Material': 'Silicone', 'Waterproof': 'Yes', 'Certification': 'FIDE Approved' },
  },
  {
    id: 9, name: 'Chess Bag Deluxe', category: 'Accessories', price: 1199,
    emoji: '🎒', description: 'Fits full set + clock, padded interior', rating: 4.4, stars: 4, stockCount: 5,
    specs: { 'Dimensions': '45 × 30 × 15 cm', 'Material': 'Nylon 600D', 'Padding': 'Foam interior', 'Pockets': '3 compartments' },
  },
];

export const categories = [
  { name: 'Chess Sets', emoji: '♟', count: 42 },
  { name: 'Boards', emoji: '♜', count: 28 },
  { name: 'Pieces', emoji: '♛', count: 35 },
  { name: 'Accessories', emoji: '⏱', count: 67 },
];

export const filterOptions = ['All', 'Chess Sets', 'Boards', 'Pieces', 'Accessories', 'Books'];

export const reviews = [
  {
    id: 1,
    text: 'The rosewood set I ordered is absolutely stunning. The pieces have perfect weight and the board arrived immaculately packed.',
    author: 'Arjun Mehta', title: 'Club Player', city: 'Mumbai', rating: 5, initials: 'AM',
  },
  {
    id: 2,
    text: 'ChessCraft is my go-to for tournament gear. The DGT clock works flawlessly and their customer support is brilliant.',
    author: 'Priya Nair', title: 'FIDE Rated Player', city: 'Bangalore', rating: 5, initials: 'PN',
  },
  {
    id: 3,
    text: 'Got the leather travel board for my son. Beautiful quality, pieces are magnetic and stay in place. Highly recommend!',
    author: 'Ramesh Iyer', title: 'Parent', city: 'Chennai', rating: 5, initials: 'RI',
  },
];

// Generate mock image views for a product
export function getProductViews(product: Product) {
  const views: { label: string; emoji: string; bgClass: string; size: string; opacity?: string; pattern?: boolean }[] = [
    { label: 'Front View', emoji: product.emoji, bgClass: 'bg-secondary', size: 'text-[120px] md:text-[160px]' },
    { label: 'Side View', emoji: product.emoji, bgClass: 'bg-card', size: 'text-[110px] md:text-[140px]', opacity: 'opacity-85' },
    { label: 'Detail View', emoji: product.emoji, bgClass: 'bg-secondary', size: 'text-[80px] md:text-[96px]', pattern: true },
  ];

  if (product.specs && (product.specs['Case'] || product.specs['Board Included'])) {
    views.push({ label: 'Packaging', emoji: '📦', bgClass: 'bg-secondary', size: 'text-[100px] md:text-[120px]' });
  }

  if (product.category === 'Chess Sets' || product.category === 'Pieces') {
    views.push({ label: 'Full Set View', emoji: '♟♛♜', bgClass: 'bg-secondary', size: 'text-[60px] md:text-[80px]' });
  }

  return views;
}
