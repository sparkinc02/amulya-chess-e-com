import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';

const paymentMethods = ['UPI', 'Credit/Debit Card', 'Net Banking', 'Cash on Delivery', 'EMI'];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pin: string;
}

export default function CheckoutModal() {
  const checkoutOpen = useUIStore((s) => s.checkoutOpen);
  const closeCheckout = useUIStore((s) => s.closeCheckout);
  const { items, subtotal, shipping, gst, grandTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState('UPI');
  const [orderId, setOrderId] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = () => setStep(3);

  const placeOrder = () => {
    const id = 'CC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderId(id);
    setStep(4);
    clearCart();
  };

  const handleClose = () => {
    closeCheckout();
    setStep(1);
  };

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-foreground/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading text-xl font-bold">
                {step === 4 ? 'Order Confirmed!' : `Checkout — Step ${step} of 3`}
              </h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Step 1: Summary */}
              {step === 1 && (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-border pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <p className="font-heading text-sm font-bold">{item.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-heading font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="space-y-2 pt-3 border-t border-border">
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping() === 0 ? 'FREE' : `₹${shipping()}`}</span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span>₹{gst().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-heading text-lg font-bold pt-2 border-t border-border">
                      <span>Grand Total</span>
                      <span className="text-primary">₹{grandTotal().toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors mt-4">
                    Continue to Delivery Details
                  </button>
                </div>
              )}

              {/* Step 2: Form */}
              {step === 2 && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {[
                    { name: 'fullName' as const, label: 'Full Name', required: true },
                    { name: 'email' as const, label: 'Email', required: true },
                    { name: 'phone' as const, label: 'Phone', required: true },
                    { name: 'address1' as const, label: 'Address Line 1', required: true },
                    { name: 'address2' as const, label: 'Address Line 2', required: false },
                    { name: 'city' as const, label: 'City', required: true },
                    { name: 'state' as const, label: 'State', required: true },
                    { name: 'pin' as const, label: 'PIN Code', required: true },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                        {field.label} {field.required && '*'}
                      </label>
                      <input
                        {...register(field.name, field.required ? { required: `${field.label} is required` } : {})}
                        className="w-full px-4 py-3 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                      {errors[field.name] && (
                        <p className="font-mono text-[10px] text-destructive mt-1">{errors[field.name]?.message}</p>
                      )}
                    </div>
                  ))}
                  <button type="submit" className="w-full py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors">
                    Continue to Payment
                  </button>
                </form>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m}
                        onClick={() => setPayment(m)}
                        className={`font-mono text-xs uppercase tracking-wider px-5 py-2 border transition-colors ${
                          payment === m
                            ? 'bg-secondary text-secondary-foreground border-secondary'
                            : 'border-border text-muted-foreground hover:border-primary'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">All payments secured by Razorpay</p>
                  <button onClick={placeOrder} className="w-full py-3 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                    Place Order ♟
                  </button>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-primary mx-auto flex items-center justify-center mb-6">
                    <Check size={32} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-2">Order Placed!</h3>
                  <p className="font-mono text-sm text-muted-foreground mb-1">Order ID: {orderId}</p>
                  <p className="font-body text-sm text-muted-foreground">
                    You'll receive confirmation on WhatsApp & Email
                  </p>
                  <button onClick={handleClose} className="mt-8 px-8 py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors">
                    Continue Shopping
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
