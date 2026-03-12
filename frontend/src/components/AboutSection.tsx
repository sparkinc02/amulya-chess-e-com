import { motion } from 'framer-motion';
import { Hammer, Crown, Zap, Award } from 'lucide-react';

const values = [
  { icon: Hammer, title: 'Handcrafted Quality', desc: 'Every piece made with care and precision' },
  { icon: Crown, title: 'Expert Curated', desc: 'Selected by chess masters and enthusiasts' },
  { icon: Zap, title: 'Fast Dispatch', desc: 'Orders shipped within 24 hours' },
  { icon: Award, title: 'Certified Products', desc: 'FIDE approved tournament equipment' },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Mini board */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col items-center gap-6"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-6 bg-primary/5 blur-2xl" />
            <div className="relative grid grid-cols-8 w-[300px] h-[300px] border-2 border-primary/30">
              {Array.from({ length: 64 }).map((_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const isLight = (row + col) % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.008 }}
                    className={isLight ? 'bg-cream/80' : 'bg-walnut/80'}
                  />
                );
              })}
            </div>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            64 Squares · Infinite Possibilities
          </p>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3">Our Story</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">About ChessCraft</h2>
          <div className="w-16 h-[2px] bg-primary mb-8" />

          <div className="space-y-5 font-body text-lg leading-relaxed text-secondary-foreground/80">
            <p>
              Founded in 2018, ChessCraft began with a simple vision: to bring the world's finest
              chess equipment to passionate players across India.
            </p>
            <p>
              Every product in our collection is hand-selected for its craftsmanship, durability,
              and beauty. From tournament-grade Staunton sets carved in Indian rosewood to precision
              DGT clocks, we believe every game deserves exceptional tools.
            </p>
            <p>
              We're more than a shop — we're a community of players, collectors, and artisans
              united by a love for the royal game.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-primary/30 p-5 hover:shadow-[0_0_20px_hsl(42_62%_55%/0.15)] hover:border-primary/60 transition-all duration-300"
              >
                <v.icon size={24} className="text-primary mb-2" />
                <h4 className="font-heading text-sm font-bold mb-1">{v.title}</h4>
                <p className="font-mono text-[10px] text-secondary-foreground/60">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
