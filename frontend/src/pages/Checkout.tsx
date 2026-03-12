import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCartStore } from '@/stores/cartStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { id: 'emi', label: 'EMI', icon: '📊' },
];

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

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, shipping, gst, grandTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState('upi');
  const [orderId, setOrderId] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = () => setStep(3);

  const placeOrder = () => {
    const id = 'CC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderId(id);
    setStep(4);
    clearCart();
  };

  if (items.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 text-center px-6">
          <span className="text-6xl block mb-4">♟</span>
          <h1 className="font-heading text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="font-body text-muted-foreground mb-6">Add some items before checking out</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ShoppingBag size={14} />
            Browse Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Order Summary', icon: ShoppingBag },
    { num: 2, label: 'Delivery', icon: Truck },
    { num: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {step !== 4 && (
            <>
              <button
                onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft size={14} />
                {step > 1 ? 'Back' : 'Continue Shopping'}
              </button>

              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-12">
                {steps.map((s, i) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`w-10 h-10 flex items-center justify-center font-mono text-sm transition-colors ${
                      step >= s.num
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step > s.num ? <Check size={16} /> : s.num}
                    </div>
                    <span className={`hidden sm:block font-mono text-xs uppercase tracking-wider ${
                      step >= s.num ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={`w-8 md:w-16 h-px mx-1 ${step > s.num ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 1: Summary */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-heading text-xl font-bold mb-4">Your Items</h2>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border border-border p-4 bg-card">
                    <div className="w-16 h-16 bg-secondary flex items-center justify-center text-2xl shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold truncate">{item.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{item.category} · Qty: {item.qty}</p>
                    </div>
                    <span className="font-heading font-bold shrink-0">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border p-6 h-fit lg:sticky lg:top-24">
                <h3 className="font-heading text-lg font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping() === 0 ? 'text-primary' : ''}>{shipping() === 0 ? 'FREE' : `₹${shipping()}`}</span>
                  </div>
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>₹{gst().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-heading text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{grandTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Continue to Delivery
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Delivery form */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-heading text-xl font-bold mb-6">Delivery Details</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-5">
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
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      {field.label} {field.required && <span className="text-primary">*</span>}
                    </label>
                    <input
                      {...register(field.name, field.required ? { required: `${field.label} is required` } : {})}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors[field.name] && (
                      <p className="font-mono text-[10px] text-destructive mt-1">{errors[field.name]?.message}</p>
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors mt-4"
                >
                  Continue to Payment
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-heading text-xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-3 mb-8">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all text-left ${
                      payment === m.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="font-mono text-sm uppercase tracking-wider">{m.label}</span>
                    {payment === m.id && (
                      <div className="ml-auto w-5 h-5 bg-primary flex items-center justify-center">
                        <Check size={12} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mb-6">All payments secured by Razorpay</p>

              <div className="bg-card border border-border p-5 mb-6">
                <div className="flex justify-between font-heading text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{grandTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                className="w-full py-4 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Place Order ♟
              </button>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-primary mx-auto flex items-center justify-center mb-8">
                <Check size={40} className="text-primary-foreground" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Order Placed!</h1>
              <p className="font-mono text-sm text-muted-foreground mb-1">Order ID: {orderId}</p>
              <p className="font-body text-lg text-muted-foreground mb-8">
                You'll receive confirmation on WhatsApp & Email
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Continue Shopping
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
