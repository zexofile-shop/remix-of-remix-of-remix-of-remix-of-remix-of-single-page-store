import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { 
  Palette, 
  Zap, 
  Heart, 
  Shield, 
  MessageCircle,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { push } from 'firebase/database';

interface SiteContent {
  whatWeOffer?: string;
  whyChooseUs?: string;
  howToBuy?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialYoutube?: string;
}

const WhatWeOfferSection = ({ content }: { content?: string }) => {
  const offerings = [
    { icon: Palette, title: 'Custom Designs', description: 'Unique personalized websites tailored to your story' },
    { icon: Heart, title: 'Made with Love', description: 'Every project is crafted with care and attention to detail' },
    { icon: Zap, title: 'Quick Delivery', description: 'Get your personalized website within 24-48 hours' },
    { icon: Shield, title: 'Lifetime Access', description: 'Your memories preserved forever with permanent hosting' },
  ];

  return (
    <section id="what-we-offer" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            What We Offer
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content || 'We create beautiful, personalized websites that capture your special moments and relationships'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-soft transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyChooseUsSection = ({ content }: { content?: string }) => {
  const reasons = [
    { title: '5000+ Happy Customers', description: 'Trusted by thousands of satisfied customers' },
    { title: '4.95 Star Rating', description: 'Consistently high ratings from our users' },
    { title: '24/7 Support', description: 'We\'re always here to help you' },
    { title: 'Affordable Prices', description: 'Quality service at budget-friendly rates' },
  ];

  return (
    <section id="why-choose-us" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content || 'We\'re dedicated to making your special moments unforgettable'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">{reason.title}</h3>
                <p className="text-sm text-muted-foreground">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowToBuySection = ({ content }: { content?: string }) => {
  const steps = [
    { icon: ShoppingCart, step: 1, title: 'Browse & Select', description: 'Choose from our collection of templates' },
    { icon: MessageCircle, step: 2, title: 'Share Details', description: 'Tell us about your special person and moments' },
    { icon: CreditCard, step: 3, title: 'Make Payment', description: 'Secure payment via Razorpay' },
    { icon: CheckCircle, step: 4, title: 'Receive Website', description: 'Get your personalized link within 24-48 hours' },
  ];

  return (
    <section id="how-to-buy" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            How to Buy
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content || 'Getting your personalized website is easy! Follow these simple steps'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card rounded-2xl p-6 text-center shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {step.step}
              </div>
              <div className="w-12 h-12 mx-auto mb-4 mt-2 bg-primary/10 rounded-full flex items-center justify-center">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactSection = ({ content }: { content: SiteContent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <section id="contact" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Contact Us
          </h2>
          <p className="text-muted-foreground">
            Have questions? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <a 
                  href={`mailto:${content?.contactEmail || 'bringcashere@gmail.com'}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {content?.contactEmail || 'bringcashere@gmail.com'}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Phone</p>
                <a 
                  href={`tel:${content?.contactPhone || '+919876543210'}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {content?.contactPhone || '+91 98765 43210'}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p className="text-muted-foreground">
                  {content?.contactAddress || 'India'}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <p className="font-medium text-foreground mb-4">Connect With Us</p>
              <div className="flex gap-3">
                {content?.socialInstagram && (
                  <a
                    href={content.socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {content?.socialFacebook && (
                  <a
                    href={content.socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {content?.socialTwitter && (
                  <a
                    href={content.socialTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {content?.socialYoutube && (
                  <a
                    href={content.socialYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {!content?.socialInstagram && !content?.socialFacebook && !content?.socialTwitter && !content?.socialYoutube && (
                  <>
                    <a href="#" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-2xl p-6 shadow-card">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Your Name</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                rows={4}
                maxLength={1000}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

const PrivacyPolicySection = ({ content }: { content?: string }) => {
  const defaultPolicy = `We value your privacy and are committed to protecting your personal information. 
  
• We collect only necessary information to provide our services
• Your data is encrypted and stored securely
• We never share your personal information with third parties without consent
• You can request deletion of your data at any time
• We use cookies to improve your browsing experience

For any privacy concerns, please contact us at bringcashere@gmail.com`;

  return (
    <section id="privacy-policy" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            Privacy Policy
          </h2>
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <p className="text-muted-foreground whitespace-pre-line">
              {content || defaultPolicy}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const RefundPolicySection = ({ content }: { content?: string }) => {
  const defaultPolicy = `We want you to be completely satisfied with your purchase.

• Refunds are available within 24 hours of purchase if work hasn't started
• Once the website is delivered, we offer free revisions (up to 2)
• No refunds after the final website is approved and delivered
• For custom projects, 50% advance is non-refundable
• If we fail to deliver within the promised timeframe, full refund is available

For refund requests, please contact us at bringcashere@gmail.com with your order details.`;

  return (
    <section id="refund-policy" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            Refund Policy
          </h2>
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <p className="text-muted-foreground whitespace-pre-line">
              {content || defaultPolicy}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main component that exports all sections
const InfoSections = () => {
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  useEffect(() => {
    const contentRef = ref(database, 'siteContent');
    const unsubscribe = onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSiteContent(data);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <WhatWeOfferSection content={siteContent.whatWeOffer} />
      <WhyChooseUsSection content={siteContent.whyChooseUs} />
      <HowToBuySection content={siteContent.howToBuy} />
      <ContactSection content={siteContent} />
      <PrivacyPolicySection content={siteContent.privacyPolicy} />
      <RefundPolicySection content={siteContent.refundPolicy} />
    </>
  );
};

export default InfoSections;
export { WhatWeOfferSection, WhyChooseUsSection, HowToBuySection, ContactSection, PrivacyPolicySection, RefundPolicySection };
