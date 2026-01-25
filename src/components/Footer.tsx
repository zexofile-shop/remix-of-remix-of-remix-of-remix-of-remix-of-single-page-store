import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import zexofileLogo from '@/assets/zexofile-logo.png';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Contact Section */}
      <section id="contact" className="py-16 border-b border-background/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Contact Us</h2>
              <p className="text-background/70">
                Have questions? We'd love to hear from you!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background/10 rounded-full">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-background/70">Email</p>
                    <a href="mailto:bringcashere@gmail.com" className="hover:text-primary">
                      bringcashere@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background/10 rounded-full">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-background/70">Phone</p>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background/10 rounded-full">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-background/70">Location</p>
                    <p>India</p>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <Input
                  placeholder="Your Name"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                />
                <Textarea
                  placeholder="Your Message"
                  rows={4}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                />
                <Button className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <div className="py-12 border-b border-background/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Refund Policy</h3>
              <p className="text-sm text-background/70 leading-relaxed">
                All digital products are non-refundable once delivered. If you face any issues 
                with your purchase, please contact us within 24 hours and we'll help resolve 
                the issue. Custom projects have separate terms discussed before starting work.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
              <p className="text-sm text-background/70 leading-relaxed">
                We respect your privacy. Your personal information is only used for order 
                processing and communication. We never sell or share your data with third 
                parties. All transactions are secured with industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <img src={zexofileLogo} alt="ZexoFile Shop" className="h-12 w-12 object-contain" />
              <div>
                <h3 className="text-xl font-bold">ZexoFile Shop</h3>
                <p className="text-sm text-background/70">
                  Your digital products destination
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-background/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-background/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-background/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>

            <p className="text-sm text-background/70">
              © {new Date().getFullYear()} ZexoFile Shop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
