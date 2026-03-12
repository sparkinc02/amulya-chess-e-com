import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { reviews } from '@/data/products';

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Testimonials</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Voices from the Board</h2>
        </motion.div>

        {/* Aggregate */}
        <div className="flex items-center justify-center gap-2 mb-14">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-primary text-primary" />
            ))}
          </div>
          <span className="font-mono text-sm text-muted-foreground">4.8 / 5 based on 340 reviews</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border p-8 relative"
            >
              {/* Decorative quote */}
              <span className="absolute top-4 right-6 font-heading text-7xl text-primary/10 leading-none select-none">
                "
              </span>

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-primary text-primary" />
                ))}
              </div>

              <p className="font-body text-base leading-relaxed text-card-foreground mb-6">
                "{review.text}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary flex items-center justify-center font-mono text-xs text-secondary-foreground font-bold">
                  {review.initials}
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-card-foreground">{review.author}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{review.title}, {review.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
