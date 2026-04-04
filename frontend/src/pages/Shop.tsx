import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ShopProductCard from "@/components/ShopProductCard";
import { useUIStore } from "@/stores/uiStore";
import { useGetProducts, useGetCategories } from "@/services/productService";
import { categories as CATEGORIES_DATA } from "@/data/data";

export default function Shop() {
  const activeFilter = useUIStore((s) => s.activeFilter);
  const setActiveFilter = useUIStore((s) => s.setActiveFilter);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "rating"
  >("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch real categories from backend
  const { data: categoriesResponse } = useGetCategories();
  const dynamicCategories = categoriesResponse?.data || [];

  // Dynamic filter options from category data
  const filterOptions = useMemo(
    () => ["All", ...dynamicCategories],
    [dynamicCategories],
  );

  // Fetch real products from backend
  const {
    data: productsResponse,
    isLoading,
    isError,
  } = useGetProducts({
    category: activeFilter === "All" ? undefined : activeFilter,
    query: search.trim() || undefined,
  });

  const productsData = productsResponse?.data || [];

  const filtered = useMemo(() => {
    let result = [...productsData];

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      // Rating is not yet in backend schema, using default for now
    }

    return result;
  }, [productsData, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 px-6 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Browse
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-card-foreground mb-6">
              The Collection
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative max-w-xl mb-8"
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search products, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-background border border-border font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </motion.div>

          {/* Filters + Sort */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`font-mono text-xs uppercase tracking-wider px-5 py-2.5 border transition-all ${
                    activeFilter === f
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={14}
                  className="text-muted-foreground"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="font-mono text-xs uppercase tracking-wider bg-background border border-border px-3 py-2 text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="default">Sort by</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
              </div>

              <div className="hidden md:flex border border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-mono text-xs uppercase tracking-widest">
                Loading Collection...
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-32 text-destructive">
              <p className="font-heading text-xl">Failed to load products</p>
              <p className="font-body text-sm mt-2">
                Please check your connection or try again later.
              </p>
            </div>
          ) : (
            <>
              <p className="font-mono text-xs text-muted-foreground mb-6">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}{" "}
                found
              </p>

              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-5xl block mb-4">♟</span>
                  <p className="font-heading text-xl text-muted-foreground">
                    No products found
                  </p>
                  <p className="font-body text-sm text-muted-foreground mt-2">
                    Try adjusting your search or filter
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((product, i) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.map((product, i) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      listView
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
