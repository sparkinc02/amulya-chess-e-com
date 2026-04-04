import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MoveRight,
  Loader2,
  Crown,
  ShoppingBag,
  Timer,
  Settings,
  BookOpen,
  Book,
  BookText,
  Bookmark,
  Tv,
  Handshake,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useGetCategories } from "@/services/productService";

// Map of normalized category IDs to Lucide icons for the UI
const CATEGORY_ICONS: Record<string, any> = {
  "chess-set": Crown,
  "chess-sets": Crown,
  "chess-bags": ShoppingBag,
  "chess-clock": Timer,
  "chess-accessories": Settings,
  "beginner-books": BookOpen,
  "middlegame-endgame-books": Book,
  "v-subramanian-books": BookText,
  "rb-ramesh-books": Bookmark,
  "demo-boards": Tv,
  "chess-rental-service": Handshake,
};

export default function CategoriesSection() {
  const setActiveFilter = useUIStore((s) => s.setActiveFilter);
  const navigate = useNavigate();

  // Fetch real categories from backend
  const { data: categoriesResponse, isLoading } = useGetCategories();
  const categories = categoriesResponse?.data || [];

  // Show only top 4 for the home page teaser
  const mainCategories = categories.slice(0, 4);

  const normalizeId = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

  const goToCategory = (catName: string) => {
    setActiveFilter(catName);
    navigate("/shop");
  };

  const shopAll = () => {
    setActiveFilter("All");
    navigate("/shop");
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // If no categories have products yet, hide section or show a message
  if (categories.length === 0) return null;

  return (
    <section
      id="shop"
      className="py-32 px-6 bg-background relative overflow-hidden"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-primary mb-4 font-bold">
              Curated Collections
            </p>
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Master the game with <br />
              <span className="text-muted-foreground italic font-light">
                premium essentials.
              </span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
          {mainCategories.map((cat, i) => {
            const catId = normalizeId(cat);
            const Icon = CATEGORY_ICONS[catId] || Crown;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <button
                  onClick={() => goToCategory(cat)}
                  className="group relative w-full aspect-[4/5] bg-card border border-border overflow-hidden flex flex-col p-10 text-left hover:border-primary/50 transition-all duration-500"
                >
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Visual Content */}
                  <div className="relative z-10 flex-1">
                    <div className="mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 origin-left">
                      <Icon
                        size={48}
                        className="text-primary group-hover:text-primary transition-colors"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {cat}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed italic opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      Handcrafted excellence for your next winning move.
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-6 border-t border-border group-hover:border-primary/20">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      View Collection
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </div>

                  {/* Animated Corner Accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 -translate-y-full translate-x-full rotate-45 group-hover:translate-y-[-50%] group-hover:translate-x-[50%] transition-transform duration-700" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Unified Explore All Collections Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={shopAll}
            className="w-full md:w-auto md:px-24 py-5 bg-secondary text-secondary-foreground font-mono text-sm uppercase tracking-[0.3em] border border-border hover:bg-secondary/90 transition-all shadow-xl active:scale-95"
          >
            Explore All Collections
          </button>
        </motion.div>
      </div>
    </section>
  );
}
