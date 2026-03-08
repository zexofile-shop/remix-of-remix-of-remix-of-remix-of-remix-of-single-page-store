import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Palette, Zap, Heart, Shield, ShoppingCart, CreditCard, CheckCircle,
  Mail, Phone, Instagram, Facebook, Twitter, Youtube, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SiteContent {
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialWhatsapp?: string;
}

const InfoSectionsCompact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const content: any = {};
        data.forEach((row: any) => { content[row.key] = row.value; });
        setSiteContent(content);
      }
    };
    fetchSettings();
  }, []);

  const offerings = [
    { icon: Palette, title: 'Custom Designs', description: 'Unique personalized products' },
    { icon: Heart, title: 'Made with Love', description: 'Crafted with care' },
    { icon: Zap, title: 'Quick Delivery', description: 'Fast digital delivery' },
    { icon: Shield, title: 'Lifetime Access', description: 'Access forever' },
  ];

  const reasons = [
    { title: '5000+ Customers', description: 'Trusted by thousands' },
    { title: '4.95 Star Rating', description: 'Highly rated' },
    { title: '24/7 Support', description: 'Always here to help' },
    { title: 'Best Prices', description: 'Affordable rates' },
  ];

  const steps = [
    { icon: ShoppingCart, step: 1, title: 'Browse & Select' },
    { icon: CreditCard, step: 2, title: 'Make Payment' },
    { icon: CheckCircle, step: 3, title: 'Get Instant Access' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) { toast.error('Please fill in all fields'); return; }
    setIsSubmitting(true);
    try {
      await supabase.from('contact_messages').insert({
        name: name.trim(), email: email.trim(), message: message.trim(), created_at: Date.now(), read: false,
      });
      toast.success('Message sent successfully!');
      setName(''); setEmail(''); setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactEmail = siteContent.contactEmail || 'contact@zexofile.com';
  const contactPhone = siteContent.contactPhone || '+91 98765 43210';

  return (
    <>
      <section id="what-we-offer" className="py-8 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">What We Offer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {offerings.map((item, index) => (
              <div key={index} className="bg-card rounded-xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center"><item.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why-choose-us" className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Why Choose Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-xs">{reason.title}</h3>
                  <p className="text-xs text-muted-foreground">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-to-buy" className="py-8 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">How to Buy</h2>
          <div className="flex justify-center items-center gap-4 md:gap-8 max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center flex-1">
                <div className="relative">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center"><step.icon className="h-5 w-5 text-primary" /></div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">{step.step}</div>
                </div>
                <h3 className="font-medium text-foreground text-xs mt-2">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Mail className="h-4 w-4 text-primary" /></div>
                <div><p className="font-medium text-foreground text-sm">Email</p><a href={`mailto:${contactEmail}`} className="text-xs text-muted-foreground hover:text-primary">{contactEmail}</a></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Phone className="h-4 w-4 text-primary" /></div>
                <div><p className="font-medium text-foreground text-sm">Phone</p><p className="text-xs text-muted-foreground">{contactPhone}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                {siteContent.socialInstagram && <a href={siteContent.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Instagram className="h-4 w-4" /></a>}
                {siteContent.socialFacebook && <a href={siteContent.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Facebook className="h-4 w-4" /></a>}
                {siteContent.socialTwitter && <a href={siteContent.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Twitter className="h-4 w-4" /></a>}
                {siteContent.socialYoutube && <a href={siteContent.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Youtube className="h-4 w-4" /></a>}
                {siteContent.socialWhatsapp && <a href={siteContent.socialWhatsapp} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><MessageCircle className="h-4 w-4" /></a>}
                {!siteContent.socialInstagram && !siteContent.socialFacebook && !siteContent.socialTwitter && !siteContent.socialYoutube && !siteContent.socialWhatsapp && (
                  <>
                    <a href="#" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Instagram className="h-4 w-4" /></a>
                    <a href="#" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Facebook className="h-4 w-4" /></a>
                    <a href="#" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
                  </>
                )}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 bg-card rounded-xl p-4 shadow-sm">
              <div className="space-y-1"><Label htmlFor="contact-name" className="text-xs">Name</Label><Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-9 text-sm" /></div>
              <div className="space-y-1"><Label htmlFor="contact-email" className="text-xs">Email</Label><Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="h-9 text-sm" /></div>
              <div className="space-y-1"><Label htmlFor="contact-message" className="text-xs">Message</Label><Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message" rows={2} className="text-sm" /></div>
              <Button type="submit" size="sm" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Message'}</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default InfoSectionsCompact;
