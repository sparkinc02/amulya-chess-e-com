import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { BUSINESS_CONFIG } from "@/config/business.config";

const contactInfo = [
  {
    icon: MapPin,
    label: BUSINESS_CONFIG.support.address,
    href: BUSINESS_CONFIG.support.mapsLink,
  },
  {
    icon: Phone,
    label: BUSINESS_CONFIG.support.phone,
    href: `tel:${BUSINESS_CONFIG.support.phone.replace(/\s+/g, "")}`,
  },
  {
    icon: Mail,
    label: BUSINESS_CONFIG.support.email,
    href: `mailto:${BUSINESS_CONFIG.support.email}`,
  },
  { icon: Clock, label: "Mon–Sat, 10 AM – 7 PM IST" },
  {
    icon: WhatsAppIcon,
    label: "Chat with us on WhatsApp",
    href: `https://wa.me/${BUSINESS_CONFIG.support.whatsapp}`,
  },
  {
    icon: Instagram,
    label: `@${BUSINESS_CONFIG.support.instagram}`,
    href: `https://instagram.com/${BUSINESS_CONFIG.support.instagram}`,
  },
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
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Get in Touch
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-card-foreground">
            Contact Us
          </h2>
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
              <div
                key={i}
                className="flex flex-col items-center text-center bg-background border border-border hover:border-primary/30 transition-colors group relative overflow-hidden"
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="w-full h-full p-8 flex flex-col items-center transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-primary/5 rounded-full mb-6 group-hover:bg-primary/10 transition-colors">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <span className="font-body text-base text-card-foreground leading-relaxed group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                  </a>
                ) : (
                  <div className="w-full h-full p-8 flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary/5 rounded-full mb-6">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <p className="font-body text-base text-card-foreground leading-relaxed">
                      {item.label}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
