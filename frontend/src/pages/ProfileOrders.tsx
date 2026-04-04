import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, PackageX } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { Order } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const statusColors: Record<string, string> = {
  ORDER_PLACED: "bg-primary/10 text-primary border-primary/30",
  PROCESSING: "bg-primary/10 text-primary border-primary/30",
  SHIPPED: "bg-blue-900/20 text-blue-500 border-blue-500/30",
  DELIVERED: "bg-green-900/20 text-green-500 border-green-500/30",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/30",
};

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const statusBorderColors: Record<string, string> = {
  ORDER_PLACED: "bg-primary",
  PROCESSING: "bg-primary",
  SHIPPED: "bg-blue-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-destructive",
};

export default function ProfileOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orders: Order[] = user?.orders || [];

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar />
      <section className="pt-28 pb-20 px-4 sm:px-6 flex-1 flex flex-col">
        <div className="max-w-4xl sm:mx-auto">
          <Link
            to="/profile"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>

          <div className="mb-10">
            <h1 className="font-heading text-4xl font-bold mb-2">My Orders</h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Track & Manage Your Purchases
            </p>
          </div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-24 sm:py-32 px-6 border border-border bg-card/30 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Decorative background blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

              <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6 border border-border relative">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_3s_ease-in-out_infinite]" />
                <PackageX size={32} className="text-muted-foreground" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-3">
                No Orders Yet
              </h2>
              <p className="font-body text-muted-foreground mb-8 max-w-sm mx-auto">
                It looks like you haven't made any purchases yet. Your journey
                to mastery begins with the right equipment.
              </p>
              <Link
                to="/shop"
                className="inline-block px-8 py-4 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(212,163,65,0.3)] hover:-translate-y-0.5"
              >
                Explore The Collection
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Link
                    to={`/profile/orders/${order.id}`}
                    className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 gap-4 border border-border bg-card/60 backdrop-blur-sm hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 overflow-hidden"
                  >
                    {/* Status Indicator Bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${statusBorderColors[order.status] || "bg-muted"}`}
                    />

                    <div className="flex items-start gap-3 sm:gap-6 min-w-0 flex-1">
                      <div className="flex -space-x-3 shrink-0 relative mt-1">
                        {order.orderItems.slice(0, 3).map((item, j) => (
                          <div
                            key={j}
                            className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-background bg-secondary rounded-full overflow-hidden shrink-0 relative z-10 shadow-sm transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-105"
                            style={{ zIndex: 3 - j }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <div
                            className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-background bg-muted rounded-full flex items-center justify-center shrink-0 relative shadow-sm"
                            style={{ zIndex: 0 }}
                          >
                            <span className="font-mono text-[9px] sm:text-[10px] font-bold">
                              +{order.orderItems.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-sm sm:text-base truncate uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">
                          ORDER #{order.id.slice(-6)}
                        </p>
                        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground truncate mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                          <span className="hidden sm:inline">
                            {" "}
                            at{" "}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          · {order.orderItems.length} Item
                          {order.orderItems.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                      <div className="flex flex-col sm:items-end gap-1">
                        <span
                          className={`font-mono text-[8px] sm:text-[9px] uppercase tracking-widest px-2 py-0.5 border backdrop-blur-sm w-fit ${statusColors[order.status] || "bg-muted/50 text-muted-foreground border-border"}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                        <span className="font-heading font-bold text-base sm:text-lg whitespace-nowrap">
                          ₹{order.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-border flex items-center justify-center bg-background group-hover:bg-primary group-hover:border-primary transition-colors duration-300 shrink-0">
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground group-hover:text-primary-foreground transition-colors"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
