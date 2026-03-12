import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { products, getProductViews } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ShopProductCard from '@/components/ShopProductCard';
import { useState, useMemo } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'shipping'>('specs');

  const product = products.find((p) => p.id === Number(id));
  const views = useMemo(() => product ? getProductViews(product) : [], [product]);
  const related = useMemo(() => product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3) : [], [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 text-center">
          <span className="text-6xl block mb-4">♟</span>
          <h1 className="font-heading text-2xl font-bold mb-2">Product not found</h1>
          <Link to="/shop" className="font-mono text-sm text-primary hover:underline">← Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAdd = () => {
    if (product.stockCount === 0) return;
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, category: product.category });
    }
    toast.success(`${product.name} (x${qty}) added to cart`);
    setCartOpen(true);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const goToSlide = (index: number) => {
    setSlideDirection(index > activeImage ? 1 : -1);
    setActiveImage(index);
  };

  const prevSlide = () => {
    setSlideDirection(-1);
    setActiveImage((prev) => (prev === 0 ? views.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setSlideDirection(1);
    setActiveImage((prev) => (prev === views.length - 1 ? 0 : prev + 1));
  };

  // Size/dimension specs highlight
  const sizeKeys = ['Size', 'King Height', 'Square', 'Square Size', 'Dimensions'];
  const sizeSpecs = product.specs
    ? Object.entries(product.specs).filter(([k]) => sizeKeys.some(sk => k.includes(sk)))
    : [];
  const materialSpec = product.specs?.['Material'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <CartSidebar />

      <section className="pt-24 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </motion.div>

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Slider */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={activeImage}
                    custom={slideDirection}
                    initial={{ x: slideDirection * 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: slideDirection * -60, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`absolute inset-0 flex items-center justify-center ${views[activeImage].bgClass}`}
                  >
                    {views[activeImage].pattern && (
                      <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'repeating-conic-gradient(hsl(var(--foreground)) 0% 25%, transparent 0% 50%)',
                        backgroundSize: '40px 40px',
                      }} />
                    )}
                    <span className={`${views[activeImage].size} ${views[activeImage].opacity || ''} relative z-10`}>
                      {views[activeImage].emoji}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Arrows */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-foreground/40 border border-background/15 text-background hover:bg-foreground/70 transition-colors"
                >
                  <ChevronLeft size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-foreground/40 border border-background/15 text-background hover:bg-foreground/70 transition-colors"
                >
                  <ChevronRight size={20} />
                </motion.button>

                {/* View label */}
                <span className="absolute bottom-3 left-3 z-20 font-mono text-[10px] uppercase tracking-wider bg-foreground/50 text-background px-3 py-1">
                  {views[activeImage].label}
                </span>

                {/* Badges */}
                {product.badge && (
                  <span className={`absolute top-4 left-4 z-20 font-mono text-xs uppercase tracking-wider px-4 py-1.5 ${
                    product.badge === 'BESTSELLER' ? 'bg-bordeaux text-cream' : 'bg-amber text-secondary'
                  }`}>{product.badge}</span>
                )}
                {discount && (
                  <span className="absolute top-4 right-4 z-20 font-mono text-xs bg-primary text-primary-foreground px-3 py-1.5">-{discount}%</span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex justify-center gap-2 mt-3">
                {views.map((view, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`w-16 h-16 flex items-center justify-center border-[1.5px] transition-colors ${view.bgClass} ${
                      i === activeImage ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{view.emoji}</span>
                  </button>
                ))}
              </div>

              {/* Dot indicators */}
              <div className="flex justify-center gap-2 mt-3">
                {views.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-[5px] rounded-full transition-all duration-300 ${
                      i === activeImage ? 'w-4 bg-primary' : 'w-[5px] bg-border'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3">{product.category}</p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

              {/* Stock */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 ${product.stockCount > 0 ? 'bg-green-500' : 'bg-destructive'}`} />
                  <span className="font-mono text-xs uppercase tracking-wider">{product.stockCount > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                {product.stockCount > 0 && product.stockCount <= 5 ? (
                  <p className="font-mono text-[11px] tracking-wider text-primary flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Only {product.stockCount} units left — order soon
                  </p>
                ) : product.stockCount === 0 ? (
                  <p className="font-mono text-[11px] tracking-wider text-destructive">Currently Out of Stock</p>
                ) : (
                  <p className="font-mono text-[11px] tracking-wider text-muted-foreground">Units Available: {product.stockCount}</p>
                )}
              </div>

              <p className="font-body text-lg leading-relaxed text-muted-foreground mb-8">{product.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-heading text-3xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <span className="font-body text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-border">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center font-mono text-lg hover:bg-muted transition-colors">−</button>
                  <span className="w-12 h-12 flex items-center justify-center font-mono text-sm border-x border-border">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center font-mono text-lg hover:bg-muted transition-colors">+</button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={product.stockCount === 0}
                  className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-secondary text-secondary-foreground font-mono text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  {product.stockCount === 0 ? 'Out of Stock' : `Add to Cart — ₹${(product.price * qty).toLocaleString('en-IN')}`}
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 border-t border-border pt-8">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck size={20} className="text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Free shipping over ₹999</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield size={20} className="text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Secure Payment</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw size={20} className="text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">7-Day Returns</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs: Specifications / Shipping */}
          {product.specs && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 border-t border-border pt-12">
              <div className="flex gap-6 mb-8 border-b border-border">
                {['specs', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`font-mono text-xs uppercase tracking-wider pb-3 border-b-2 transition-colors ${
                      activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'specs' ? 'Specifications' : 'Shipping & Returns'}
                  </button>
                ))}
              </div>

              {activeTab === 'specs' && (
                <div className="max-w-2xl">
                  {/* Size highlight */}
                  {sizeSpecs.length > 0 && (
                    <div className="bg-primary/[0.08] border border-primary/25 p-5 mb-6">
                      <p className="font-mono text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                        📐 Size & Dimensions
                      </p>
                      <p className="font-body text-foreground">
                        {sizeSpecs.map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        {materialSpec && ` · Material: ${materialSpec}`}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border/50">
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{key}</span>
                        <span className="font-body text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="max-w-2xl space-y-4 font-body text-muted-foreground">
                  <p>Free shipping on orders above ₹999. Standard delivery within 3-5 business days.</p>
                  <p>Easy 7-day returns from date of delivery. Item must be unused, in original packaging.</p>
                  <p>Initiate returns via WhatsApp or email with order ID and photos. Free pickup for defective items.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-16 px-6 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-card-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <ShopProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
