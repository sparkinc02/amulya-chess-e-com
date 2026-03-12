import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

interface AddressForm {
  address1: string;
  address2: string;
  city: string;
  state: string;
  pin: string;
}

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function ProfileSettings() {
  const { user, updateAddress } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  const { register, handleSubmit } = useForm<AddressForm>({
    defaultValues: user?.address || {},
  });

  if (!user) return null;

  const onSave = (data: AddressForm) => {
    updateAddress(data);
    toast.success('Address saved ✓');
  };

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

          {/* Address - Editable */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-heading text-xl font-bold mb-5">Saved Address</h2>
            <form onSubmit={handleSubmit(onSave)} className="border border-border bg-card p-6 space-y-5">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Address Line 1</label>
                <input {...register('address1')} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Address Line 2</label>
                <input {...register('address2')} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">City</label>
                  <input {...register('city')} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">State</label>
                  <select {...register('state')} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors">
                    <option value="">Select State</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="max-w-xs">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">PIN Code</label>
                <input {...register('pin')} maxLength={6} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors" />
              </div>
              <button type="submit" className="px-8 py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors">
                Save Address
              </button>
            </form>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
