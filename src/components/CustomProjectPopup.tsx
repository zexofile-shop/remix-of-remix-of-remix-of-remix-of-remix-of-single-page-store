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
      <DialogContent className="max-w-[90%] sm:max-w-sm p-0 overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-background via-background to-secondary/30 rounded-2xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 bg-secondary/80 hover:bg-secondary transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Decorative Header */}
        <div className="relative pt-6 pb-3 px-5 text-center overflow-hidden">
          {/* Floating sparkles - no animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Sparkles className="absolute top-4 left-6 h-3 w-3 text-primary/40" />
            <Star className="absolute top-10 right-10 h-2.5 w-2.5 text-gold/50" />
            <Sparkles className="absolute bottom-6 right-6 h-4 w-4 text-primary/30" />
            <Star className="absolute bottom-3 left-12 h-3 w-3 text-gold/40" />
          </div>

          {/* Main Icon - no animation */}
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-3">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Build Your Dream Website!
            </DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground mt-2 text-xs md:text-sm leading-relaxed">
            Have a unique idea? Let us bring it to life with a 
            <span className="text-primary font-semibold"> custom-made website </span>
            just for you!
          </p>
        </div>

        {/* Features Grid */}
        <div className="px-5 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border/50"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <span className="text-[11px] md:text-xs font-medium text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-5 pb-5 pt-1 space-y-2">
          <Button
            onClick={handleYes}
            size="default"
            className="w-full rounded-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Yes, I Want a Custom Website!
          </Button>
          
          <button
            onClick={onClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
          >
            Maybe later, just browsing
          </button>
        </div>

        {/* Bottom Accent */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </DialogContent>
    </Dialog>
  );
};

export default CustomProjectPopup;
