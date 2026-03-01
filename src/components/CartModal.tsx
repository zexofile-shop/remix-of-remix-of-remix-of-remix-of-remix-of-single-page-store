import { useState } from 'react';
import { ShoppingCart, Trash2, Loader2, CreditCard, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  cart?: Product[];
}

const CartModal = ({ isOpen, onClose, cartItems, onRemove, onAuthRequired, onProfileOpen, cart }: CartModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const items: CartItem[] = cartItems.length > 0 ? cartItems : (cart || []).map(p => ({
    product: p,
    selectedOption: 'left' as const,
    price: p.price,
    label: 'Source Code'
  }));
  
  const total = items.reduce((sum, item) => sum + item.price, 0);

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
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-primary/15 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              Your Cart
              {items.length > 0 && (
                <Badge className="ml-auto bg-primary/15 text-primary border-0 text-xs">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
        </div>

        {items.length === 0 ? (
          <div className="py-12 px-6 text-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">Discover amazing digital products</p>
            <Button variant="outline" onClick={onClose} className="rounded-full px-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Items */}
            <ScrollArea className="flex-1 min-h-0 max-h-[45vh]">
              <div className="p-4 space-y-3">
                {items.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.selectedOption}-${index}`}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50 hover:border-border transition-colors group"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-14 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{item.product.title}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] mt-1 ${item.selectedOption === 'right' ? 'border-purple-500/40 text-purple-600 bg-purple-50/50 dark:bg-purple-900/20' : 'border-primary/40 text-primary bg-primary/5'}`}
                      >
                        {item.selectedOption === 'right' ? (
                          <><Palette className="h-2.5 w-2.5 mr-1" />{item.label}</>
                        ) : (
                          <><CreditCard className="h-2.5 w-2.5 mr-1" />{item.label}</>
                        )}
                      </Badge>
                      <p className="text-primary font-bold mt-1 text-sm">₹{item.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 opacity-60 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all h-8 w-8"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 pt-3 border-t border-border bg-card space-y-3">
              {customizableCount > 0 && (
                <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Palette className="h-3 w-3 flex-shrink-0" />
                    {customizableCount} item(s) need customization form after payment
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center px-1">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">₹{total}</span>
              </div>
              
              <Button 
                className="w-full rounded-xl py-5 text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20" 
                size="lg" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  <>Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
              
              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Login required to complete your purchase
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
