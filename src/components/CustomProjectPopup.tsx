import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Palette, Zap, Wallet, Heart, Star } from 'lucide-react';

interface CustomProjectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
}

const CustomProjectPopup = ({ isOpen, onClose, onYes }: CustomProjectPopupProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const features = [
    { icon: <Palette className="h-5 w-5" />, text: 'Fully Customized Design' },
    { icon: <Wallet className="h-5 w-5" />, text: 'Affordable Pricing' },
    { icon: <Zap className="h-5 w-5" />, text: 'Quick Delivery' },
    { icon: <Heart className="h-5 w-5" />, text: 'Made with Love' },
  ];

  const handleYes = () => {
    onYes();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-background via-background to-secondary/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 bg-secondary/80 hover:bg-secondary transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Decorative Header */}
        <div className="relative pt-8 pb-4 px-6 text-center overflow-hidden">
          {/* Floating sparkles animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Sparkles className="absolute top-4 left-8 h-4 w-4 text-primary/40 animate-pulse" />
            <Star className="absolute top-12 right-12 h-3 w-3 text-gold/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute bottom-8 right-8 h-5 w-5 text-primary/30 animate-pulse" style={{ animationDelay: '1s' }} />
            <Star className="absolute bottom-4 left-16 h-4 w-4 text-gold/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>

          {/* Main Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-50" />
            <Sparkles className="h-10 w-10 text-primary" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Build Your Dream Website!
            </DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
            Have a unique idea? Let us bring it to life with a 
            <span className="text-primary font-semibold"> custom-made website </span>
            just for you!
          </p>
        </div>

        {/* Features Grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/50 transition-all duration-300 ${
                  isAnimating ? 'animate-fade-in' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 pb-6 pt-2 space-y-3">
          <Button
            onClick={handleYes}
            size="lg"
            className="w-full rounded-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02]"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Yes, I Want a Custom Website!
          </Button>
          
          <button
            onClick={onClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Maybe later, just browsing
          </button>
        </div>

        {/* Bottom Accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </DialogContent>
    </Dialog>
  );
};

export default CustomProjectPopup;
