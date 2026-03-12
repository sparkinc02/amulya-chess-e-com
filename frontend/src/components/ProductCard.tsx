import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Product } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { toast } from 'sonner';

interface Props {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      category: product.category,
    });
    toast.success(`${product.name} added to cart`);
    setCartOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group bg-background border border-border hover:shadow-xl transition-shadow"
    >
      {/* Image area */}
      <div className="relative bg-secondary h-52 flex items-center justify-center">
        <span className="text-6xl">{product.emoji}</span>
        {product.badge && (
          <span
            className={`absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-3 py-1 ${
              product.badge === 'BESTSELLER'
                ? 'bg-bordeaux text-cream'
                : 'bg-amber text-secondary'
            }`}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < product.stars ? 'fill-primary text-primary' : 'text-border'}
            />
          ))}
          <span className="font-mono text-[10px] text-muted-foreground ml-2">{product.rating}</span>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          {product.category}
        </p>
        <h3 className="font-heading text-lg font-bold text-foreground mb-1">{product.name}</h3>
        <p className="font-body text-sm text-muted-foreground mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-heading text-xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="font-body text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
