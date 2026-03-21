import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/lib/types'; // Using real Product type
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { toast } from 'sonner';

interface Props {
  product: Product;
  index: number;
  listView?: boolean;
}

export default function ShopProductCard({ product, index, listView }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const cartItem = items.find((i) => i.id === product.id);
  const cartQty = cartItem?.qty || 0;

  // Real data mapping
  const displayImage = product.images?.[0] || "";
  const stockCount = product.stock || 0;
  const isSale = product.originalPrice > product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stockCount === 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: displayImage,
      category: product.category,
      stock: stockCount,
    });
    toast.success(`${product.name} added to cart`);
    setCartOpen(true);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQty >= stockCount) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: displayImage,
      category: product.category,
      stock: stockCount,
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQty(product.id, cartQty - 1);
  };

  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Link to={`/product/${product.id}`} className="group flex gap-6 bg-background border border-border hover:shadow-lg transition-all p-4">
          <div className="relative bg-secondary w-32 h-32 flex items-center justify-center shrink-0 overflow-hidden">
            {displayImage ? (
              <img src={displayImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <span className="text-5xl">♟</span>
            )}
            
            {isSale && (
              <span className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-amber text-secondary">SALE</span>
            )}
            {product.isFeatured && (
              <span className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-bordeaux text-cream">FEATURED</span>
            )}

            <AnimatePresence>
              {cartQty > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute bottom-2 left-2 bg-primary text-secondary font-mono text-[10px] px-2 py-0.5 tracking-wider z-10">
                  <ShoppingCart size={12} className="inline mr-1" /> × {cartQty}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{product.category}</p>
              <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
              <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice > product.price && (
                  <span className="font-body text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                )}
              </div>
              {stockCount > 0 && (
                cartQty > 0 ? (
                  <div className="flex items-center border border-border" onClick={(e) => e.preventDefault()}>
                    <button onClick={handleDecrement} className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"><Minus size={12} /></button>
                    <span className="w-7 h-7 flex items-center justify-center font-mono text-xs border-x border-border">{cartQty}</span>
                    <button 
                      onClick={handleIncrement} 
                      disabled={cartQty >= stockCount}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                    ><Plus size={12} /></button>
                  </div>
                ) : (
                  <button 
                    onClick={handleAdd} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>
                )
              )}
              {stockCount <= 0 && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-destructive/70 px-3 py-2 border border-destructive/20 bg-destructive/5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                   Out of Stock
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/product/${product.id}`} className="group block bg-background border border-border hover:shadow-xl transition-shadow">
        <div className="relative bg-secondary h-64 flex items-center justify-center overflow-hidden">
          {displayImage ? (
            <img src={displayImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <span className="text-7xl group-hover:scale-110 transition-transform duration-500">♟</span>
          )}

          {isSale && (
            <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-3 py-1 bg-amber text-secondary">SALE</span>
          )}
          {product.isFeatured && (
             <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-3 py-1 bg-bordeaux text-cream">FEATURED</span>
          )}

          <AnimatePresence>
            {cartQty > 0 && (
              <motion.span
                key={cartQty}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-3 left-3 bg-primary text-secondary font-mono text-[10px] px-2 py-1 tracking-wider z-10"
              >
                <ShoppingCart size={12} className="inline mr-1" /> × {cartQty}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1 truncate">{product.name}</h3>
          <p className="font-body text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2 min-h-[2.5rem]">{product.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <span className="font-body text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
            <AnimatePresence mode="wait">
              {stockCount > 0 ? (
                cartQty > 0 ? (
                  <motion.div
                    key="qty-controls"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center border border-border"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button onClick={handleDecrement} className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"><Minus size={12} /></button>
                    <span className="w-7 h-7 flex items-center justify-center font-mono text-xs border-x border-border">{cartQty}</span>
                    <button 
                      onClick={handleIncrement} 
                      disabled={cartQty >= stockCount}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                    ><Plus size={12} /></button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="add-btn"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={handleAdd}
                    className="p-2.5 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag size={18} />
                  </motion.button>
                )
              ) : (
                <motion.span
                  key="out-of-stock"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[9px] uppercase tracking-tighter text-destructive/80 font-bold"
                >
                  Sold Out
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
