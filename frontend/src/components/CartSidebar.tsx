import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';

export default function CartSidebar() {
  const { items, removeItem, updateQty, subtotal, shipping, totalItems } = useCartStore();
  const cartOpen = useUIStore((s) => s.cartOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const navigate = useNavigate();

  const sub = subtotal();
  const ship = shipping();

  const whatsappLink = () => {
    const summary = items.map((i) => `${i.emoji} ${i.name} x${i.qty} — ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('%0A');
    return `https://wa.me/919876543210?text=Hi!%20I'd%20like%20to%20order:%0A${summary}%0A%0ATotal:%20₹${sub.toLocaleString('en-IN')}`;
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-foreground/40 z-[70]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-[80] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-border">
              <h2 className="font-heading text-lg font-bold">Your Cart ({totalItems()})</h2>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-5xl block mb-4">♟</span>
                  <p className="font-heading text-lg text-muted-foreground">Your board is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                    <div className="w-16 h-16 bg-secondary flex items-center justify-center text-2xl shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold truncate">{item.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">₹{item.price.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted">
                          <Minus size={12} />
                        </button>
                        <span className="font-mono text-sm w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-3">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{sub.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{ship === 0 ? 'FREE' : `₹${ship}`}</span>
                </div>
                {sub < 999 && (
                  <p className="font-mono text-[10px] text-primary">Free shipping on orders above ₹999</p>
                )}

                <button
                  onClick={() => { setCartOpen(false); navigate('/checkout'); }}
                  className="w-full py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors mt-2"
                >
                  Proceed to Checkout
                </button>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] text-secondary font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <WhatsAppIcon size={14} />
                  Order via WhatsApp
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
