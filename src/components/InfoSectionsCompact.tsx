import { useState, useEffect } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { 
  Palette, 
  Zap, 
  Heart, 
  Shield, 
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter
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
}

const InfoSectionsCompact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  // Fetch site content from Firebase
  useEffect(() => {
    const siteContentRef = ref(database, 'siteContent');
    const unsubscribe = onValue(siteContentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSiteContent(data);
      }
    });

    return () => unsubscribe();
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
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await push(ref(database, 'contactMessages'), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: Date.now(),
        status: 'unread',
      });
      
      toast.success('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use Firebase data or fallback defaults
  const contactEmail = siteContent.contactEmail || 'contact@zexofile.com';
  const contactPhone = siteContent.contactPhone || '+91 98765 43210';

  return (
    <>
      {/* What We Offer - Compact */}
      <section id="what-we-offer" className="py-8 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">
            What We Offer
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {offerings.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-4 text-center shadow-sm"
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Compact */}
      <section id="why-choose-us" className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50"
              >
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

      {/* How to Buy - Compact */}
      <section id="how-to-buy" className="py-8 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">
            How to Buy
          </h2>
          <div className="flex justify-center items-center gap-4 md:gap-8 max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center flex-1">
                <div className="relative">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-medium text-foreground text-xs mt-2">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact - Compact */}
      <section id="contact" className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">
            Contact Us
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Email</p>
                  <a href={`mailto:${contactEmail}`} className="text-xs text-muted-foreground hover:text-primary">
                    {contactEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Phone</p>
                  <p className="text-xs text-muted-foreground">{contactPhone}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {siteContent.socialInstagram && (
                  <a href={siteContent.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {siteContent.socialFacebook && (
                  <a href={siteContent.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {siteContent.socialTwitter && (
                  <a href={siteContent.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {!siteContent.socialInstagram && !siteContent.socialFacebook && !siteContent.socialTwitter && (
                  <>
                    <a href="#" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-3 bg-card rounded-xl p-4 shadow-sm">
              <div className="space-y-1">
                <Label htmlFor="contact-name" className="text-xs">Name</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-email" className="text-xs">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-message" className="text-xs">Message</Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message"
                  rows={2}
                  className="text-sm"
                />
              </div>
              <Button type="submit" size="sm" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default InfoSectionsCompact;
