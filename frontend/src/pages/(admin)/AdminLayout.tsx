import {
  BarChart3,
  Box,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/SidebarProvider";
import { useLocalStorage } from "@/lib/hooks/hooks";
import { Toaster } from "sonner";
import { useAuth } from "@/features/auth/AuthContext";
import { useGetOrders } from "./orders/orderService";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: getOrdersResponse } = useGetOrders();
  const ordersCount = getOrdersResponse?.data?.length || 0;

  // Handle missing SidebarContext provider gracefully if it hasn't been added yet
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  let sidebarContext;
  try {
    sidebarContext = useSidebar();
  } catch(e) {
    sidebarContext = { isOpen: isSidebarOpen, toggle: () => setIsSidebarOpen(!isSidebarOpen) };
  }
  const { isOpen, toggle } = sidebarContext;

  const [theme, setTheme] = useLocalStorage<"light" | "dark">("admin-theme", "dark");
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Apply admin B&W theme to <html> so portal components (dialogs, dropdowns)
  // also receive the correct CSS variables. Restore on unmount.
  useEffect(() => {
    const html = document.documentElement;
    const prevClasses = Array.from(html.classList);
    html.classList.add("admin-theme");
    html.classList.toggle("dark", theme === "dark");
    return () => {
      html.classList.remove("admin-theme", "dark", "light");
      prevClasses.forEach((cls) => html.classList.add(cls));
    };
  }, []);

  // Keep <html> dark/light in sync when user toggles
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);



  const routes = [
    {
      label: "Products",
      icon: Package,
      to: "/admin/products",
      active: pathname === "/admin" || pathname === "/admin/" || pathname.includes("/admin/products"),
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      to: "/admin/orders",
      active: pathname.includes("/admin/orders"),
      badge: ordersCount || 0,
    },
    {
      label: "Customers",
      icon: Users,
      to: "/admin/customers",
      active: pathname.includes("/admin/customers"),
    },
  ];

  if (!user || user.role !== 'admin') {
     return null;
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold font-heading tracking-widest uppercase">
          {isOpen ? <span>Amulya Chess</span> : <span>AC</span>}
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => (
            <Link
              key={i}
              to={route.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/20 hover:text-primary transition-colors font-mono",
                route.active
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground",
                !isOpen && "justify-center"
              )}
            >
              <route.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="flex-1 truncate">{route.label}</span>}
              {isOpen && route.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {route.badge}
                  </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={toggle}
        >
          <Menu className="mr-2 h-4 w-4" />
          {isOpen && <span>Collapse</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background font-body">
      <Toaster position="bottom-right" />
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 hidden lg:flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-[70px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content - Mobile Sidebar is now handled inside header */}

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isOpen ? "lg:ml-64" : "lg:ml-[70px]"
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggle}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </div>
          </div>

          <div className="flex-1 font-heading font-bold uppercase tracking-wider text-muted-foreground text-xs sm:text-sm truncate">
             Admin Control Panel
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              {theme === "light" ? (
                <MoonIcon className="h-4 w-4" />
              ) : (
                <SunIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8 border border-primary/20">
                            <AvatarImage src={user?.picture} alt={user?.userName} />
                            <AvatarFallback className="bg-primary/10 text-primary">{user?.userName?.slice(0,2).toUpperCase() || 'AD'}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.userName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/profile">My Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/">Return to Store</Link></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
