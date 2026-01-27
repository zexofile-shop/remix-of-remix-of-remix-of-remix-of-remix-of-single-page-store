import { useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coupon } from '@/types/coupon';
import { toast } from 'sonner';
import { Loader2, Ticket, X, PartyPopper } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CouponInputProps {
  originalAmount: number;
  userId: string;
  userEmail: string;
  onApply: (discount: number, couponId: string, couponCode: string) => void;
  onRemove: () => void;
  appliedCoupon: { code: string; discount: number } | null;
}

const CouponInput = ({ 
  originalAmount, 
  userId, 
  userEmail,
  onApply, 
  onRemove,
  appliedCoupon 
}: CouponInputProps) => {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsChecking(true);

    try {
      const couponsRef = ref(database, 'coupons');
      const snapshot = await get(couponsRef);
      
      if (!snapshot.exists()) {
        toast.error('Invalid coupon code');
        setIsChecking(false);
        return;
      }

      const coupons = snapshot.val();
      let foundCoupon: (Coupon & { id: string }) | null = null;

      // Find coupon by code (case-insensitive)
      for (const [id, coupon] of Object.entries(coupons)) {
        const c = coupon as Coupon;
        if (c.code.toLowerCase() === code.trim().toLowerCase()) {
          foundCoupon = { ...c, id };
          break;
        }
      }

      if (!foundCoupon) {
        toast.error('Invalid coupon code');
        setIsChecking(false);
        return;
      }

      // Check if coupon is active
      if (!foundCoupon.active) {
        toast.error('This coupon is no longer active');
        setIsChecking(false);
        return;
      }

      // Check max uses
      if (foundCoupon.usedCount >= foundCoupon.maxUses) {
        toast.error('This coupon has reached its usage limit');
        setIsChecking(false);
        return;
      }

      // Check if user already used this coupon
      if (foundCoupon.usedBy && foundCoupon.usedBy[userId]) {
        toast.error('You have already used this coupon');
        setIsChecking(false);
        return;
      }

      // Check minimum order value
      if (originalAmount < foundCoupon.minOrderValue) {
        toast.error(`Minimum order value is ₹${foundCoupon.minOrderValue}`);
        setIsChecking(false);
        return;
      }

      // Calculate discount
      const discount = Math.round((originalAmount * foundCoupon.discountPercent) / 100);
      setDiscountAmount(discount);
      
      // Show congratulations popup
      setShowCongrats(true);
      
      // Apply the coupon
      onApply(discount, foundCoupon.id, foundCoupon.code);
      setCode('');
      
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRemoveCoupon = () => {
    onRemove();
    setDiscountAmount(0);
  };

  return (
    <>
      <div className="space-y-3">
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {appliedCoupon.code} applied
              </span>
              <span className="text-sm text-green-600">(-₹{appliedCoupon.discount})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="h-8 w-8 p-0 text-green-600 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
            <Button
              variant="outline"
              onClick={handleApplyCoupon}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Congratulations Popup */}
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="py-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-scale-in">
              <PartyPopper className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-muted-foreground mb-4">
              Coupon applied successfully!
            </p>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-3xl font-bold text-green-600">
                ₹{discountAmount} OFF
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                saved on this order
              </p>
            </div>
            <Button 
              className="mt-6 w-full" 
              onClick={() => setShowCongrats(false)}
            >
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CouponInput;
