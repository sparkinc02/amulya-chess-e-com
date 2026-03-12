import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import CartSidebar from '@/components/CartSidebar';
import AboutSection from '@/components/AboutSection';

import ContactSection from '@/components/ContactSection';
import PoliciesSection from '@/components/PoliciesSection';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <AboutSection />
      
      <ContactSection />
      <PoliciesSection />
      <Footer />
      <CartSidebar />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
