import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ShopProductCard from "@/components/ShopProductCard";
import { useState, useMemo, useEffect } from "react";
import { useGetProductById, useGetProducts } from "@/services/productService";
import { BUSINESS_CONFIG } from "@/config/business.config";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "shipping">("specs");

  // Fetch real product from backend
  const {
    data: productResponse,
    isLoading,
    isError,
  } = useGetProductById(id || "");
  const product = productResponse?.data;

  // Fetch related products (same category)
  const { data: relatedResponse } = useGetProducts({
    category: product?.category,
  });
  const related = useMemo(
    () => relatedResponse?.data?.filter((p) => p.id !== id).slice(0, 3) || [],
    [relatedResponse, id],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
    setQty(1);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Fetching masterpiece...
        </p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 text-center px-6">
          <span className="text-6xl block mb-4">♟</span>
          <h1 className="font-heading text-2xl font-bold mb-2">
            Product not found
          </h1>
          <p className="font-body text-muted-foreground mb-6">
            The item you're looking for is unavailable.
          </p>
          <Link
            to="/shop"
            className="font-mono text-sm text-primary hover:underline"
          >
            ← Back to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAdd = () => {
    if (product.stock === 0) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        category: product.category,
        stock: product.stock, // Added stock to payload
      },
      qty,
    ); // Pass the local state quantity
    toast.success(`${product.name} (x${qty}) added to cart`);
    setCartOpen(true);
  };

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  const images =
    product.images && product.images.length > 0 ? product.images : [];

  const goToSlide = (index: number) => {
    setSlideDirection(index > activeImage ? 1 : -1);
    setActiveImage(index);
  };

  const prevSlide = () => {
    setSlideDirection(-1);
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setSlideDirection(1);
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-24 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-8"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {product.name}
            </span>
          </motion.div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Slider */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-card border border-border shadow-sm">
                {images.length > 0 ? (
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    <motion.div
                      key={activeImage}
                      custom={slideDirection}
                      initial={{ x: slideDirection * 60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: slideDirection * -60, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={images[activeImage]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <span className="text-[160px] opacity-20">♟</span>
                  </div>
                )}

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 hover:bg-background border border-border text-foreground shadow-sm transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 hover:bg-background border border-border text-foreground shadow-sm transition-colors"
                    >
                      <ChevronRight size={20} />
                    </motion.button>
                  </>
                )}

                {/* Badges */}
                {product.isFeatured && (
                  <span className="absolute top-4 left-4 z-20 font-mono text-xs uppercase tracking-wider px-4 py-1.5 bg-bordeaux text-cream">
                    FEATURED
                  </span>
                )}
                {discount && (
                  <span className="absolute top-4 right-4 z-20 font-mono text-xs bg-primary text-primary-foreground px-3 py-1.5">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      className={`w-16 h-16 flex items-center justify-center border-[1.5px] transition-colors bg-transparent ${
                        i === activeImage
                          ? "border-primary"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      className={`h-[5px] rounded-full transition-all duration-300 ${
                        i === activeImage
                          ? "w-4 bg-primary"
                          : "w-[5px] bg-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col"
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3">
                {product.category}
              </p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>

              {/* Stock */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 ${product.stock > 0 ? "bg-green-500" : "bg-destructive"}`}
                  />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                {product.stock > 0 && product.stock <= 5 ? (
                  <p className="font-mono text-[11px] tracking-wider text-primary flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Only {product.stock} units left
                    — order soon
                  </p>
                ) : product.stock === 0 ? (
                  <p className="font-mono text-[11px] tracking-wider text-destructive">
                    Currently Out of Stock
                  </p>
                ) : (
                  <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                    Units Available: {product.stock}
                  </p>
                )}
              </div>

              <p className="font-body text-lg leading-relaxed text-muted-foreground mb-8">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-heading text-3xl font-bold text-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice > product.price && (
                  <span className="font-body text-lg text-muted-foreground line-through decoration-primary/30">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <div className="grid grid-cols-3 border border-border bg-card w-full sm:w-40 h-12 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="flex items-center justify-center font-mono text-lg hover:bg-muted transition-colors border-r border-border"
                  >
                    −
                  </button>
                  <span className="flex items-center justify-center font-mono text-sm">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    disabled={qty >= product.stock}
                    className="flex items-center justify-center font-mono text-lg hover:bg-muted transition-colors border-l border-border disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-3 py-3.5 px-6 bg-foreground text-background font-mono text-xs sm:text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <ShoppingBag
                    size={18}
                    className="shrink-0 group-hover:-translate-y-0.5 transition-transform"
                  />
                  <span className="text-center">
                    {product.stock === 0
                      ? "Out of Stock"
                      : `Add to Cart — ₹${(product.price * qty).toLocaleString("en-IN")}`}
                  </span>
                </button>
              </div>

              {/* Options */}
              {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                <div className="space-y-6 mb-8 border-t border-border pt-8">
                  {product.colors?.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Available Colors
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((c) => (
                          <span
                            key={c}
                            className="px-3 py-1.5 border border-border font-mono text-[11px] tracking-tight"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.sizes?.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Sizes
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1.5 border border-border font-mono text-[11px] tracking-tight"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 border-t border-border pt-8">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck size={20} className="text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Free shipping over ₹
                    {BUSINESS_CONFIG.pricing.shippingThreshold}
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield size={20} className="text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Secure Payment
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw size={20} className="text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    7-Day Returns
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs: Specifications / Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 border-t border-border pt-12"
          >
            <div className="flex gap-6 mb-8 border-b border-border">
              {["specs", "shipping"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`font-mono text-xs uppercase tracking-wider pb-3 border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "specs" ? "Details" : "Shipping & Returns"}
                </button>
              ))}
            </div>

            {activeTab === "specs" && (
              <div className="max-w-2xl">
                <div className="space-y-3">
                  {[
                    { label: "Category", value: product.category },
                    { label: "Sub-Category", value: product.subcategory },
                    {
                      label: "Product ID",
                      value: product.id.slice(-8).toUpperCase(),
                    },
                    { label: "Material", value: "Premium Wood / Mixed" },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="flex justify-between py-2 border-b border-border/50"
                    >
                      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {spec.label}
                      </span>
                      <span className="font-body text-foreground">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="max-w-2xl space-y-4 font-body text-muted-foreground">
                <p>
                  Free shipping on orders above ₹
                  {BUSINESS_CONFIG.pricing.shippingThreshold.toLocaleString(
                    "en-IN",
                  )}
                  . Standard delivery within 3-5 business days.
                </p>
                <p>
                  Easy 7-day returns from date of delivery. Item must be unused,
                  in original packaging.
                </p>
                <p>
                  Initiate returns via WhatsApp or email with order ID and
                  photos.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-16 px-6 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-card-foreground mb-8 uppercase tracking-widest">
              You May Also Like
            </h2>
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
