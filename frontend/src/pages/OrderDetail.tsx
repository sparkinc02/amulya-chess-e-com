import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Package,
  Truck,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const statusBannerStyles: Record<string, string> = {
  ORDER_PLACED: "bg-primary/10 border-b-2 border-primary",
  PROCESSING: "bg-primary/10 border-b-2 border-primary",
  SHIPPED: "bg-[rgba(45,106,79,0.12)] border-b-2 border-[#2D6A4F]",
  DELIVERED: "bg-[rgba(45,106,79,0.2)] border-b-2 border-[#2D6A4F]",
  CANCELLED: "bg-destructive/10 border-b-2 border-destructive",
};

const statusIcons: Record<string, React.ReactNode> = {
  ORDER_PLACED: <Package size={22} />,
  PROCESSING: <Package size={22} />,
  SHIPPED: <Truck size={22} />,
  DELIVERED: <Check size={22} />,
  CANCELLED: <span className="text-xl">✕</span>,
};

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const order = user?.orders?.find((o) => o.id === id);

  if (!user) return null;

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 text-center">
          <span className="text-5xl block mb-4">📦</span>
          <h1 className="font-heading text-2xl font-bold mb-2">
            Order not found
          </h1>
          <Link
            to="/profile/orders"
            className="font-mono text-sm text-primary hover:underline"
          >
            ← Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Status Banner */}
      <div
        className={`pt-20 ${statusBannerStyles[order.status] || "bg-muted border-b-2 border-border"}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          <span
            className={`${statusBannerStyles[order.status] ? "text-primary" : "text-muted-foreground"}`}
          >
            {statusIcons[order.status] || <Package size={22} />}
          </span>
          <div>
            <p className="font-heading text-xl font-bold uppercase">
              {formatStatus(order.status)}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              #{order.id.slice(-8)} ·{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {new Date(order.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/profile/orders"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back to Orders
          </Link>

          {/* Tracking Timeline */}
          <div className="mb-10">
            <h2 className="font-heading text-lg font-bold mb-5">Tracking</h2>
            <div className="flex items-start relative pb-4">
              {[
                {
                  label: "Order Placed",
                  statusMatch: [
                    "ORDER_PLACED",
                    "PROCESSING",
                    "SHIPPED",
                    "DELIVERED",
                  ],
                },
                {
                  label: "Processing",
                  statusMatch: ["PROCESSING", "SHIPPED", "DELIVERED"],
                },
                { label: "Shipped", statusMatch: ["SHIPPED", "DELIVERED"] },
                { label: "Delivered", statusMatch: ["DELIVERED"] },
              ].map((step, i, arr) => {
                const isDone = step.statusMatch.includes(order.status);
                const showLine = i < arr.length - 1;
                const animDelay = i * 0.7; // Base delay for stagger

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center text-center relative z-10"
                  >
                    <motion.div
                      className={`w-8 h-8 flex items-center justify-center mb-2 mx-auto rounded-full border-2 relative z-10 ${isDone ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(212,163,65,0.4)]" : "bg-background text-muted-foreground border-muted"}`}
                      initial={
                        isDone
                          ? { scale: 0, rotate: -180, opacity: 0 }
                          : { scale: 0, opacity: 0 }
                      }
                      animate={
                        isDone
                          ? { scale: 1, rotate: 0, opacity: 1 }
                          : { scale: 1, opacity: 1 }
                      }
                      transition={{
                        delay: animDelay,
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      {isDone ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <span className="font-mono text-[10px]">{i + 1}</span>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: animDelay + 0.2, duration: 0.4 }}
                    >
                      <p
                        className={`font-mono text-[10px] uppercase tracking-wider font-bold ${isDone ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {step.label}
                      </p>
                      {step.label === "Order Placed" && (
                        <p className="font-mono text-[9px] text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      )}
                      {step.label === "Delivered" &&
                        isDone &&
                        order.updatedAt && (
                          <p className="font-mono text-[9px] text-muted-foreground mt-1">
                            {new Date(order.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                    </motion.div>

                    {/* Connecting Line */}
                    {showLine && (
                      <div className="absolute top-4 left-[50%] w-full h-[2px] -z-10 bg-muted overflow-hidden">
                        {step.statusMatch.includes(order.status) && (
                          <motion.div
                            className="h-full bg-primary origin-left"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              delay: animDelay + 0.35,
                              duration: 0.45,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {order.status === "CANCELLED" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center z-20"
                >
                  <p className="font-heading font-bold text-destructive uppercase tracking-widest bg-background px-4 py-2 border border-destructive shadow-lg">
                    Order Cancelled
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Ordered Items */}
          <div className="mb-10">
            <h2 className="font-heading text-lg font-bold mb-5">
              Ordered Items
            </h2>
            <div className="space-y-3">
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border border-border bg-card"
                >
                  <div className="w-20 h-20 bg-background border border-border flex items-center justify-center shrink-0 p-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-bold">{item.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Size: {item.size} · Color: {item.color}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      Qty: {item.quantity} × ₹
                      {item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="font-heading font-bold shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Price Breakdown */}
            <div>
              <h2 className="font-heading text-lg font-bold mb-5">
                Price Breakdown
              </h2>
              <div className="border border-border bg-card p-5 space-y-3">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={order.shipping === 0 ? "text-primary" : ""}>
                    {order.shipping === 0 ? "FREE" : `₹${order.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">GST (Included)</span>
                  <span>-</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-heading text-xl font-bold">
                    Grand Total
                  </span>
                  <span className="font-heading text-xl font-bold text-primary">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div>
              <h2 className="font-heading text-lg font-bold mb-5">
                Delivery Details
              </h2>
              <div className="border border-border bg-card p-5 space-y-4 h-[calc(100%-48px)]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1">
                    Address
                  </p>
                  <p className="font-body">
                    {order.shippingAddress.addressLine},{" "}
                    {order.shippingAddress.apartment &&
                      `${order.shippingAddress.apartment}, `}{" "}
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    – {order.shippingAddress.pincode}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1">
                    Contact Phone
                  </p>
                  <p className="font-body">
                    {order.shippingAddress.phone || user.phone}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1">
                    Payment Method
                  </p>
                  <p className="font-body">
                    {order.paymentInfo?.method || "RAZORPAY"}
                    <Badge
                      variant={order.isPaid ? "success" : "warning"}
                      className="ml-2"
                    >
                      {order.isPaid ? "PAID" : "PENDING"}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
