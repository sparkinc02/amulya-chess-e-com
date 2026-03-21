import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

const contactInfo = [
  { icon: MapPin, label: '42, Chess Lane, T. Nagar, Chennai – 600017, Tamil Nadu, India' },
  { icon: Phone, label: '+91 98765 43210' },
  { icon: Mail, label: 'hello@chesscraftindia.com' },
  { icon: Clock, label: 'Mon–Sat, 10 AM – 7 PM IST' },
  { icon: WhatsAppIcon, label: 'Chat with us on WhatsApp' },
  { icon: Instagram, label: '@chesscraftindia' },
];

export default function ContactSection() {

  return (
    <section id="contact" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Get in Touch</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-card-foreground">Contact Us</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
          >
            {contactInfo.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 bg-background border border-border hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/5 rounded-full mb-6 group-hover:bg-primary/10 transition-colors">
                  <item.icon size={22} className="text-primary" />
                </div>
                <p className="font-body text-base text-card-foreground leading-relaxed">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
