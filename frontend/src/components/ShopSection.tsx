import { motion } from 'framer-motion';
import { products, filterOptions } from '@/data/products';
import { useUIStore } from '@/stores/uiStore';
import ProductCard from './ProductCard';

export default function ShopSection() {
  const activeFilter = useUIStore((s) => s.activeFilter);
  const setActiveFilter = useUIStore((s) => s.setActiveFilter);

  const filtered = activeFilter === 'All'
    ? products
    : products.filter((p) => p.category === activeFilter);

  return (
    <section id="shop" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Curated</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-card-foreground">The Shop</h2>
        </motion.div>

        {/* Filter bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-mono text-xs uppercase tracking-wider px-5 py-2 border transition-colors ${
                activeFilter === f
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
