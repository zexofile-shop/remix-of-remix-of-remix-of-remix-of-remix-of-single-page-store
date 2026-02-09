import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { CreditCard, Palette, Sparkles, Zap, CheckCircle2 } from 'lucide-react';

export interface CartItem {
  product: Product;
  selectedOption: 'left' | 'right';
  price: number;
  label: string;
}

interface CartOptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSelectOption: (option: 'left' | 'right') => void;
}

const CartOptionDialog = ({ isOpen, onClose, product, onSelectOption }: CartOptionDialogProps) => {
  if (!product) return null;

  const leftPricing = {
    price: product.leftButton?.price ?? product.price,
    originalPrice: product.leftButton?.originalPrice ?? product.originalPrice,
    label: product.leftButton?.label || 'Source Code',
    description: product.leftButton?.description || 'Get the complete source code',
  };

  const rightPricing = product.rightButton ? {
    price: product.rightButton.price,
    originalPrice: product.rightButton.originalPrice,
    label: product.rightButton.label || 'Get Customized',
    description: product.rightButton.description || 'We customize it for you',
  } : product.allowCustomization ? {
    price: product.price,
    originalPrice: product.originalPrice,
    label: 'Get Customized',
    description: 'We customize it for you',
  } : null;

  const hasRightOption = !!rightPricing;

  const leftSavings = leftPricing.originalPrice && leftPricing.originalPrice > leftPricing.price 
    ? Math.round(((leftPricing.originalPrice - leftPricing.price) / leftPricing.originalPrice) * 100)
    : 0;

  const rightSavings = rightPricing?.originalPrice && rightPricing.originalPrice > rightPricing.price 
    ? Math.round(((rightPricing.originalPrice - rightPricing.price) / rightPricing.originalPrice) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 pb-3">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Select Your Option</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              How would you like this product?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choose the option that best suits your needs
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Product Preview */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl">
            <img
              src={product.image}
              alt={product.title}
              className="w-14 h-14 object-cover rounded-xl shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{product.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-5 space-y-3">
          {/* Left Option - Source Code */}
          <button
            onClick={() => onSelectOption('left')}
            className="w-full p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-left group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <div className="flex items-start gap-3 relative">
              <div className="p-2.5 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">{leftPricing.label}</h4>
                    {leftSavings > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        {leftSavings}% OFF
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {leftPricing.originalPrice && leftPricing.originalPrice > leftPricing.price && (
                      <span className="text-[10px] text-muted-foreground line-through mr-1">
                        ₹{leftPricing.originalPrice}
                      </span>
                    )}
                    <span className="font-bold text-primary">₹{leftPricing.price}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{leftPricing.description}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-primary/80">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Instant digital delivery</span>
                </div>
              </div>
            </div>
          </button>

          {/* Right Option - Customized */}
          {hasRightOption && rightPricing && (
            <button
              onClick={() => onSelectOption('right')}
              className="w-full p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-2 border-purple-500/20 rounded-2xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 text-left group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="flex items-start gap-3 relative">
                <div className="p-2.5 bg-purple-500/15 rounded-xl group-hover:bg-purple-500/25 transition-colors shrink-0">
                  <Palette className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{rightPricing.label}</h4>
                      {rightSavings > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                          {rightSavings}% OFF
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {rightPricing.originalPrice && rightPricing.originalPrice > rightPricing.price && (
                        <span className="text-[10px] text-muted-foreground line-through mr-1">
                          ₹{rightPricing.originalPrice}
                        </span>
                      )}
                      <span className="font-bold text-purple-600">₹{rightPricing.price}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rightPricing.description}</p>
                  {product.rightButton?.showForm && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-500/80">
                      <CreditCard className="h-3 w-3" />
                      <span>Customization form after payment</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Button variant="ghost" onClick={onClose} className="w-full rounded-xl text-muted-foreground hover:text-foreground">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartOptionDialog;
