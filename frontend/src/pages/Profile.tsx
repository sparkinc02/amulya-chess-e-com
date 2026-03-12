import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-primary flex items-center justify-center text-primary-foreground font-heading text-xl font-bold">
                {user.userName?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'U'}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold">{user.userName}</h1>
                <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/profile/orders" className="group flex items-center gap-4 p-6 border border-border bg-card hover:border-primary transition-colors">
                <Package size={24} className="text-primary" />
                <div>
                  <p className="font-heading font-bold group-hover:text-primary transition-colors">My Orders</p>
                  <p className="font-mono text-xs text-muted-foreground">Track & manage orders</p>
                </div>
              </Link>

              <Link to="/profile/settings" className="group flex items-center gap-4 p-6 border border-border bg-card hover:border-primary transition-colors">
                <Settings size={24} className="text-primary" />
                <div>
                  <p className="font-heading font-bold group-hover:text-primary transition-colors">Settings</p>
                  <p className="font-mono text-xs text-muted-foreground">Address & preferences</p>
                </div>
              </Link>

              <button onClick={() => { logout(); navigate('/'); }} className="group flex items-center gap-4 p-6 border border-border bg-card hover:border-destructive transition-colors text-left">
                <LogOut size={24} className="text-destructive" />
                <div>
                  <p className="font-heading font-bold group-hover:text-destructive transition-colors">Sign Out</p>
                  <p className="font-mono text-xs text-muted-foreground">Log out of your account</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
