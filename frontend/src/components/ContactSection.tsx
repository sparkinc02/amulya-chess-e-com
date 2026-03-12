import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { useForm } from 'react-hook-form';

const contactInfo = [
  { icon: MapPin, label: '42, Chess Lane, T. Nagar, Chennai – 600017, Tamil Nadu, India' },
  { icon: Phone, label: '+91 98765 43210' },
  { icon: Mail, label: 'hello@chesscraftindia.com' },
  { icon: Clock, label: 'Mon–Sat, 10 AM – 7 PM IST' },
  { icon: WhatsAppIcon, label: 'Chat with us on WhatsApp' },
  { icon: Instagram, label: '@chesscraftindia' },
];

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>();

  const onSubmit = () => {
    setSent(true);
    reset();
    setTimeout(() => setSent(false), 4000);
  };

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

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {contactInfo.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <item.icon size={18} className="text-primary mt-1 shrink-0" />
                <p className="font-body text-base text-card-foreground">{item.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Name *</label>
              <input {...register('name', { required: 'Name is required' })} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none" />
              {errors.name && <p className="font-mono text-[10px] text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Email *</label>
              <input {...register('email', { required: 'Email is required' })} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none" />
              {errors.email && <p className="font-mono text-[10px] text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Subject</label>
              <select {...register('subject')} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none">
                <option>Order Query</option>
                <option>Product Info</option>
                <option>Return Request</option>
                <option>General</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Message *</label>
              <textarea {...register('message', { required: 'Message is required' })} rows={5} className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:border-primary focus:outline-none resize-none" />
              {errors.message && <p className="font-mono text-[10px] text-destructive mt-1">{errors.message.message}</p>}
            </div>

            {sent && (
              <p className="font-mono text-xs text-primary">✓ We'll reply within 24 hours!</p>
            )}

            <button type="submit" className="w-full py-3 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors">
              Send Message ♟
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
