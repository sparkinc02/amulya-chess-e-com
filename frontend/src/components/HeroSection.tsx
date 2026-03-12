import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
const pieces = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖'],
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Est. 2018 · Handcrafted Excellence
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[1.1] mb-6 text-foreground">
            Every move
            <br />
            tells a <em className="text-primary not-italic">story.</em>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-md mb-10 leading-relaxed">
            Premium chess sets, boards, and accessories crafted for players who
            appreciate the art behind every game.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground font-mono text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Shop Now
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center px-8 py-3 border border-foreground text-foreground font-mono text-sm uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
            >
              Our Story
            </a>
          </div>

          <div className="flex gap-10">
            {[
              { value: '2,400+', label: 'Happy Players' },
              { value: '180+', label: 'Products' },
              { value: '98%', label: 'Satisfaction' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-2xl font-bold text-primary">{stat.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right - Chess Board */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:flex items-center justify-center"
        >
          {/* Spinning rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[420px] h-[420px] border border-primary/20 animate-spin-slow absolute" />
            <div className="w-[480px] h-[480px] border border-primary/10 animate-spin-reverse absolute" />
            {/* Radial glow */}
            <div className="w-[350px] h-[350px] bg-primary/5 blur-3xl absolute" />
          </div>

          {/* Board */}
          <div className="animate-float relative z-10 border-2 border-primary/40 shadow-2xl">
            <div className="grid grid-cols-8 w-[320px] h-[320px]">
              {pieces.flat().map((piece, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const isLight = (row + col) % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-lg select-none ${
                      isLight ? 'bg-cream dark:bg-cream/90' : 'bg-walnut'
                    } ${!isLight ? 'text-cream' : 'text-walnut'}`}
                  >
                    {piece}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 right-0 bg-secondary py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12">
          {Array.from({ length: 3 }).map((_, rep) => (
            <span key={rep} className="flex gap-12 font-mono text-xs uppercase tracking-[0.3em] text-secondary-foreground/60">
              <span>Handcrafted</span>
              <span>·</span>
              <span>Tournament Grade</span>
              <span>·</span>
              <span>Fast Shipping</span>
              <span>·</span>
              <span>Certified Pieces</span>
              <span>·</span>
              <span>Est. 2018</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
