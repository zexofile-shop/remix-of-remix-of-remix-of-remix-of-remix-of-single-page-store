import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { CreditCard, Palette } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Option</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={product.image}
              alt={product.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mb-4">
            Select which option you want to add to cart:
          </p>

          <div className="space-y-3">
            {/* Left Option */}
            <button
              onClick={() => onSelectOption('left')}
              className="w-full p-4 border-2 border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{leftPricing.label}</h4>
                    <div className="text-right">
                      {leftPricing.originalPrice && leftPricing.originalPrice > leftPricing.price && (
                        <span className="text-xs text-muted-foreground line-through mr-2">
                          ₹{leftPricing.originalPrice}
                        </span>
                      )}
                      <span className="font-bold text-primary">₹{leftPricing.price}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{leftPricing.description}</p>
                </div>
              </div>
            </button>

            {/* Right Option */}
            {hasRightOption && rightPricing && (
              <button
                onClick={() => onSelectOption('right')}
                className="w-full p-4 border-2 border-purple-500/30 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Palette className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{rightPricing.label}</h4>
                      <div className="text-right">
                        {rightPricing.originalPrice && rightPricing.originalPrice > rightPricing.price && (
                          <span className="text-xs text-muted-foreground line-through mr-2">
                            ₹{rightPricing.originalPrice}
                          </span>
                        )}
                        <span className="font-bold text-purple-600">₹{rightPricing.price}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rightPricing.description}</p>
                    {product.rightButton?.showForm && (
                      <span className="inline-block mt-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Customization Form Required
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CartOptionDialog;
