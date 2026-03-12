import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import Navbar from '@/components/Navbar';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <ShieldCheck size={64} className="text-primary mb-6" />
        <h1 className="font-heading text-4xl font-bold mb-3">Admin Dashboard</h1>
        <p className="font-body text-lg text-muted-foreground mb-8">
          Coming Soon — Full admin panel in next release.
        </p>
        <Link to="/" className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-primary hover:underline">
          <ArrowLeft size={14} /> Back to Store
        </Link>
      </div>
    </div>
  );
}
