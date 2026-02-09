import { useState } from 'react';
import { ShoppingCart, Trash2, Loader2, CreditCard, Palette } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartItem, Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemove: (index: number) => void;
  onAuthRequired?: () => void;
  onProfileOpen?: () => void;
  // Legacy support for old cart prop
  cart?: Product[];
}

const CartModal = ({ isOpen, onClose, cartItems, onRemove, onAuthRequired, onProfileOpen, cart }: CartModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use cartItems if provided, otherwise convert legacy cart to cartItems
  const items: CartItem[] = cartItems.length > 0 ? cartItems : (cart || []).map(p => ({
    product: p,
    selectedOption: 'left' as const,
    price: p.price,
    label: 'Source Code'
  }));
  
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // Count items that require customization form
  const customizableCount = items.filter(item => 
    item.selectedOption === 'right' && 
    (item.product.rightButton?.showForm || item.product.allowCustomization)
  ).length;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      onClose();
      onAuthRequired?.();
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    onClose();
    navigate('/cart-checkout');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({items.length})
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button variant="outline" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.product.id}-${item.selectedOption}-${index}`}
                className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${item.selectedOption === 'right' ? 'border-purple-500 text-purple-600' : 'border-primary text-primary'}`}
                    >
                      {item.selectedOption === 'right' ? (
                        <><Palette className="h-2.5 w-2.5 mr-1" />{item.label}</>
                      ) : (
                        <><CreditCard className="h-2.5 w-2.5 mr-1" />{item.label}</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-primary font-semibold mt-1">₹{item.price}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            {customizableCount > 0 && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  📝 {customizableCount} item(s) require customization form after payment
                </p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">₹{total}</span>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
              
              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  You need to login to complete your purchase
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
