import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ShoppingBag,
  CreditCard,
  Truck,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useCartStore } from "@/stores/cartStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useAuth } from "@/features/auth/AuthContext";
import {
  usePlaceOrder,
  useVerifyPayment,
} from "@/features/checkout/checkoutService";
import { loadRazorpayScript } from "@/features/checkout/razorpayService";
import { toast } from "sonner";
import { BUSINESS_CONFIG } from "@/config/business.config";

const paymentMethods = [
  { id: "upi", label: "Razorpay (UPI, Card, etc.)", icon: "💳" },
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
  saveInfo: boolean;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const { items, subtotal, shipping, gst, grandTotal, clearCart } =
    useCartStore();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const placeOrderMutation = usePlaceOrder();
  const verifyPaymentMutation = useVerifyPayment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      fullName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone === "GoogleAuthUser" ? "" : user?.phone || "",
      address1: user?.address?.addressLine || "",
      address2: user?.address?.apartment || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pin: user?.address?.pincode || "",
      saveInfo: true,
    },
  });

  // Pre-fill if user data becomes available after mount
  useEffect(() => {
    if (user) {
      if (user.userName) setValue("fullName", user.userName);
      if (user.email) setValue("email", user.email);
      if (user.phone && user.phone !== "GoogleAuthUser")
        setValue("phone", user.phone);
      if (user.address) {
        setValue("address1", user.address.addressLine);
        setValue("address2", user.address.apartment || "");
        setValue("city", user.address.city);
        setValue("state", user.address.state);
        setValue("pin", user.address.pincode);
      }
    }
  }, [user, setValue]);

  // Pre-load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().then((success) => {
      if (!success) console.error("Failed to pre-load Razorpay script");
    });
  }, []);

  const [deliveryData, setDeliveryData] = useState<FormData | null>(null);

  const onDeliverySubmit = (data: FormData) => {
    setDeliveryData(data);
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryData) return;
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const res = await placeOrderMutation.mutateAsync({
        cartItems: items.map((item) => ({
          productId: item.id,
          quantity: item.qty,
        })),
        subtotal: subtotal(),
        shipping: shipping(),
        total: grandTotal(),
        state: deliveryData.state,
      });

      const { razorpayOrderId, key, amount, currency } = res.data;
      console.log("[Checkout] Key received from backend:", key);

      // 2. Load Razorpay script (as back-up if mount-load failed)
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error(
          "Failed to load Razorpay. Please check your internet connection.",
        );
        setIsProcessing(false);
        return;
      }

      // 3. Open Razorpay Overlay
      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // Ensure it's in paise for the overlay if needed? Backend usually sends in rupees
        currency,
        name: BUSINESS_CONFIG.company.name,
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // 4. Verify payment on backend
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartItems: items.map((item) => ({
                productId: item.id,
                quantity: item.qty,
              })),
              address: {
                addressLine: deliveryData.address1,
                apartment: deliveryData.address2,
                city: deliveryData.city,
                state: deliveryData.state,
                pincode: deliveryData.pin,
                phone: deliveryData.phone,
              },
              saveInfo: deliveryData.saveInfo,
              subtotal: subtotal(),
              shipping: shipping(),
              total: grandTotal(),
            });

            setOrderId(razorpayOrderId);
            setStep(4);
            clearCart();
            await refresh();
            toast.success("Payment successful!");
          } catch (err: any) {
            toast.error(
              err.response?.data?.message || "Payment verification failed.",
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: deliveryData.fullName,
          email: deliveryData.email,
          contact: deliveryData.phone,
        },
        theme: {
          color: "#d4a341",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to initiate order. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 text-center px-6">
          <span className="text-6xl block mb-4">♟</span>
          <h1 className="font-heading text-2xl font-bold mb-2">
            Your cart is empty
          </h1>
          <p className="font-body text-muted-foreground mb-6">
            Add some items before checking out
          </p>
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
    { num: 1, label: "Order Summary", icon: ShoppingBag },
    { num: 2, label: "Delivery", icon: Truck },
    { num: 3, label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {step !== 4 && (
            <>
              <button
                onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft size={14} />
                {step > 1 ? "Back" : "Continue Shopping"}
              </button>

              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
                Checkout
              </h1>

              <div className="flex items-center gap-2 mb-12">
                {steps.map((s, i) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 flex items-center justify-center font-mono text-sm transition-colors ${
                        step >= s.num
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > s.num ? <Check size={16} /> : s.num}
                    </div>
                    <span
                      className={`hidden sm:block font-mono text-xs uppercase tracking-wider ${
                        step >= s.num
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-8 md:w-16 h-px mx-1 ${step > s.num ? "bg-primary" : "bg-border"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Your Items
                </h2>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border border-border p-4 bg-card"
                  >
                    <div className="w-16 h-16 bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{item.emoji || "♟"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold truncate">
                        {item.name}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.category} · Qty: {item.qty}
                      </p>
                    </div>
                    <span className="font-heading font-bold shrink-0">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border p-6 h-fit lg:sticky lg:top-24">
                <h3 className="font-heading text-lg font-bold mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal().toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping() === 0 ? "text-primary" : ""}>
                      {shipping() === 0 ? "FREE" : `₹${shipping()}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-muted-foreground">
                      GST ({BUSINESS_CONFIG.pricing.gstPercentage}%)
                    </span>
                    <span>₹{gst().toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-heading text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{grandTotal().toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Continue to Delivery
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-heading text-xl font-bold mb-6">
                Delivery Details
              </h2>
              <form
                onSubmit={handleSubmit(onDeliverySubmit)}
                className="max-w-2xl mx-auto space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("fullName", {
                        required: "Name is required",
                      })}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors.fullName && (
                      <p className="font-mono text-[10px] text-destructive mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("email", { required: "Email is required" })}
                      type="email"
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors.email && (
                      <p className="font-mono text-[10px] text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      Phone <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("phone", {
                        required: "Phone is required",
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Phone must be exactly 10 digits",
                        },
                      })}
                      type="tel"
                      maxLength={10}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors.phone && (
                      <p className="font-mono text-[10px] text-destructive mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      Address Line 1 <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("address1", {
                        required: "Address is required",
                      })}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors.address1 && (
                      <p className="font-mono text-[10px] text-destructive mt-1">
                        {errors.address1.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      Address Line 2 (Apartment, Suite, etc.)
                    </label>
                    <input
                      {...register("address2")}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      City <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("city", { required: "City is required" })}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors.city && (
                      <p className="font-mono text-[10px] text-destructive mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      State <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("state", { required: "State is required" })}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors.state && (
                      <p className="font-mono text-[10px] text-destructive mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      PIN Code <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("pin", {
                        required: "PIN is required",
                        pattern: {
                          value: /^\d{6}$/,
                          message: "PIN must be exactly 6 digits",
                        },
                      })}
                      maxLength={6}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                    {errors.pin && (
                      <p className="font-mono text-[10px] text-destructive mt-1">
                        {errors.pin.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="saveInfo"
                    {...register("saveInfo")}
                    className="w-4 h-4 accent-primary"
                  />
                  <label
                    htmlFor="saveInfo"
                    className="font-mono text-xs text-muted-foreground cursor-pointer"
                  >
                    Save this information for next time
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors mt-4"
                >
                  Continue to Payment
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-heading text-xl font-bold mb-6">
                Payment Method
              </h2>
              <div className="space-y-3 mb-8">
                {paymentMethods.map((m) => (
                  <div
                    key={m.id}
                    className="w-full flex items-center gap-4 p-4 border border-primary bg-primary/5 cursor-default"
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="font-mono text-sm uppercase tracking-wider">
                      {m.label}
                    </span>
                    <div className="ml-auto w-5 h-5 bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border p-5 mb-6">
                <div className="flex justify-between font-heading text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">
                    ₹{grandTotal().toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>Place Order ♟</>
                )}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-primary mx-auto flex items-center justify-center mb-8">
                <Check size={40} className="text-primary-foreground" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
                Order Confirmed!
              </h1>
              <p className="font-mono text-sm text-muted-foreground mb-1">
                Order ID: {orderId}
              </p>
              <p className="font-body text-lg text-muted-foreground mb-8">
                You'll receive confirmation on WhatsApp & Email
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/profile/orders"
                  className="px-8 py-3.5 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  View Your Orders
                </Link>
                <Link
                  to="/shop"
                  className="px-8 py-3.5 border border-border text-foreground font-mono text-xs uppercase tracking-wider hover:bg-secondary transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
