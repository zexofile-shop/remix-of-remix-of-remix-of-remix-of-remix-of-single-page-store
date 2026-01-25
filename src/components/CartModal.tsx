import { useState } from 'react';
import { ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { initiatePayment, PurchaseRecord } from '@/services/paymentService';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[];
  onRemove: (productId: string) => void;
  onAuthRequired?: () => void;
  onProfileOpen?: () => void;
}

const CartModal = ({ isOpen, onClose, cart, onRemove, onAuthRequired, onProfileOpen }: CartModalProps) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<PurchaseRecord | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      onClose();
      onAuthRequired?.();
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Process payment for the first item in cart
    // For multiple items, you would loop or combine them
    setIsProcessing(true);
    setCurrentProductIndex(0);
    
    const processPayment = async (index: number) => {
      if (index >= cart.length) {
        setIsProcessing(false);
        return;
      }

      const product = cart[index];
      
      try {
        await initiatePayment(
          product,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          (purchase) => {
            setLastPurchase(purchase);
            setShowSuccessModal(true);
            onRemove(product.id);
            setIsProcessing(false);
            
            // Process next item after modal is closed
            if (index + 1 < cart.length) {
              setCurrentProductIndex(index + 1);
            }
          },
          (error) => {
            toast.error(error);
            setIsProcessing(false);
          }
        );
      } catch (error) {
        toast.error('Payment failed. Please try again.');
        setIsProcessing(false);
      }
    };

    await processPayment(0);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // If there are more items, process the next one
    if (currentProductIndex + 1 < cart.length) {
      // For now, let user manually proceed with remaining items
    } else {
      onClose();
    }
  };

  const handleViewProfile = () => {
    setShowSuccessModal(false);
    onClose();
    onProfileOpen?.();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({cart.length})
            </DialogTitle>
          </DialogHeader>

          {cart.length === 0 ? (
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
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-primary font-semibold">₹{item.price}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

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

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        purchase={lastPurchase}
        onViewProfile={handleViewProfile}
      />
    </>
  );
};

export default CartModal;
