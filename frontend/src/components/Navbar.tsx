import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  Sun,
  Moon,
  User,
  ShieldCheck,
  LogOut,
  Settings,
  Package,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useAuth } from "@/features/auth/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { BUSINESS_CONFIG } from "@/config/business.config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useUIStore((s) => s.toggleCart);
  const { isDark, toggle: toggleTheme } = useTheme();
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">♛</span>
            <span className="font-heading text-xl font-bold tracking-wide text-foreground">
              {BUSINESS_CONFIG.company.name}
            </span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleCart}
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-mono font-bold flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User Avatar / Auth buttons */}
            {isLoading ? (
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 bg-primary text-primary-foreground font-mono text-xs font-bold flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.userName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerText =
                            user.userName
                              ?.split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "U";
                        }
                      }}
                    />
                  ) : (
                    user.userName
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "U"
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-64 bg-card border border-border shadow-xl z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary text-primary-foreground font-mono text-sm font-bold flex items-center justify-center overflow-hidden">
                            {user.picture ? (
                              <img
                                src={user.picture}
                                alt={user.userName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerText =
                                      user.userName
                                        ?.split(" ")
                                        .map((w) => w[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase() || "U";
                                  }
                                }}
                              />
                            ) : (
                              user.userName
                                ?.split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "U"
                            )}
                          </div>
                          <div>
                            <p className="font-heading text-sm font-bold">
                              {user.userName}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {user.role === "admin" && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/admin");
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors border-b border-border text-left"
                        >
                          <ShieldCheck size={16} className="text-primary" />
                          <div>
                            <p className="font-mono text-xs uppercase tracking-wider">
                              Admin Dashboard
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              Manage products & orders
                            </p>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors text-left"
                      >
                        <User size={15} className="text-muted-foreground" />
                        <span className="font-mono text-xs">My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/profile/orders");
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors text-left"
                      >
                        <Package size={15} className="text-muted-foreground" />
                        <span className="font-mono text-xs">My Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/profile/settings");
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors text-left"
                      >
                        <Settings size={15} className="text-muted-foreground" />
                        <span className="font-mono text-xs">Settings</span>
                      </button>

                      <div className="border-t border-border">
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                            navigate("/");
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-destructive/5 transition-colors text-left"
                        >
                          <LogOut size={15} className="text-destructive" />
                          <span className="font-mono text-xs text-destructive">
                            Sign Out
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary"
                >
                  <User size={14} />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  <UserPlus size={14} />
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-foreground"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16">
              <span className="font-heading text-xl font-bold">
                ♛ {BUSINESS_CONFIG.company.name}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="font-heading text-3xl font-bold text-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="font-heading text-3xl font-bold text-foreground hover:text-primary transition-colors"
                >
                  Shop
                </Link>
              </motion.div>
              {isLoading ? (
                <div className="w-24 h-12 bg-muted animate-pulse rounded-md" />
              ) : !user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="font-heading text-3xl font-bold text-primary"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="font-heading text-3xl font-bold text-foreground hover:text-primary transition-colors"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="font-heading text-3xl font-bold text-foreground hover:text-primary transition-colors"
                  >
                    My Profile
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
