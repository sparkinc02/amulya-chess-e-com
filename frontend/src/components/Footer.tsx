import { Instagram } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

const quickLinks = ['Home', 'Shop', 'About Us', 'Contact Us', 'Track Order', 'Blog (coming soon)'];
const policyLinks = ['Payment Policy', 'Refund Policy', 'Return Policy', 'Privacy Policy', 'Terms of Service'];
const paymentPills = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'COD', 'EMI'];

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">♛</span>
            <span className="font-heading text-lg font-bold">ChessCraft</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">Play with Purpose</p>
          <p className="font-body text-sm text-secondary-foreground/70 mb-5 leading-relaxed">
            India's premier destination for handcrafted chess equipment. Every piece tells a story.
          </p>
          <div className="flex gap-3">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-[#25D366] hover:border-[#25D366] transition-colors"
            >
              <WhatsAppIcon size={16} />
            </a>
            <a
              href="#"
              className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading text-sm font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link}>
                <a href="#" className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-heading text-sm font-bold mb-4">Policies</h4>
          <ul className="space-y-2">
            {policyLinks.map((link) => (
              <li key={link}>
                <a href="#policies" className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading text-sm font-bold mb-4">Contact</h4>
          <div className="space-y-2 font-body text-sm text-secondary-foreground/60">
            <p>42, Chess Lane, T. Nagar<br />Chennai – 600017</p>
            <p>+91 98765 43210</p>
            <p>hello@chesscraftindia.com</p>
            <p>Mon–Sat · 10AM–7PM IST</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[10px] text-secondary-foreground/40">
          © 2025 ChessCraft. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-2">
          {paymentPills.map((p) => (
            <span key={p} className="font-mono text-[10px] px-3 py-1 border border-border text-secondary-foreground/40">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
