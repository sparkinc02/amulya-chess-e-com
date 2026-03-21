import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

export default function ProfileSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
 
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
 
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <Link to="/profile" className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Profile
          </Link>

          <h1 className="font-heading text-3xl font-bold mb-10">Profile Settings</h1>

          {/* Personal Info - Read Only */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h2 className="font-heading text-xl font-bold mb-5">Personal Information</h2>
            <div className="border border-border bg-card p-6 space-y-5">
              {[
                { label: 'Name', value: user.userName },
                { label: 'Email', value: user.email },
                { label: 'Phone', value: `+91 ${user.phone}` },
              ].map((field) => (
                <div key={field.label} className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
                      {field.label} <Lock size={11} className="text-muted-foreground" />
                    </p>
                    <p className="font-body text-foreground">{field.value}</p>
                  </div>
                </div>
              ))}
              <p className="font-mono text-[10px] text-muted-foreground italic">
                To update personal details, contact support at hello@chesscraftindia.com
              </p>
            </div>
          </motion.div>

          {/* Address - Read Only */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-heading text-xl font-bold mb-5">Saved Address</h2>
            <div className="border border-border bg-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Address Line 1', value: user.address?.addressLine },
                  { label: 'Address Line 2', value: user.address?.apartment || '—' },
                  { label: 'City', value: user.address?.city },
                  { label: 'State', value: user.address?.state },
                  { label: 'PIN Code', value: user.address?.pincode },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
                      {field.label} <Lock size={11} className="text-muted-foreground" />
                    </p>
                    <p className="font-body text-foreground">{field.value || 'Not provided'}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed italic">
                  Address details are locked here to ensure accuracy. You can update your saved address by entering new details during the checkout process on your next order.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
