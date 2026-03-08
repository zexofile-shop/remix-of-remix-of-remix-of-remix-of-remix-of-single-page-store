import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, User } from 'lucide-react';
import { PurchaseRecord } from '@/services/paymentService';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: PurchaseRecord | null;
  onViewProfile: () => void;
}

const PaymentSuccessModal = ({ isOpen, onClose, purchase, onViewProfile }: PaymentSuccessModalProps) => {
  if (!purchase) return null;

  const handleAccessProduct = () => {
    if (purchase.delivery_link) {
      window.open(purchase.delivery_link, '_blank');
    }
  };

  const handleViewProfile = () => {
    onClose();
    onViewProfile();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Payment Successful!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-foreground mb-1">{purchase.product_title}</p>
            <p className="text-2xl font-bold text-primary">₹{purchase.amount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-2">Payment ID: {purchase.razorpay_payment_id}</p>
          </div>
          <div className="w-full max-w-[200px] aspect-video rounded-lg overflow-hidden mb-6">
            <img src={purchase.product_image} alt={purchase.product_title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-3 w-full">
            {purchase.delivery_link && (
              <Button size="lg" className="w-full gap-2" onClick={handleAccessProduct}>
                <ExternalLink className="h-5 w-5" />Access Your Product
              </Button>
            )}
            <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleViewProfile}>
              <User className="h-5 w-5" />View in My Purchases
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">You can always access your purchased products from your profile.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessModal;
