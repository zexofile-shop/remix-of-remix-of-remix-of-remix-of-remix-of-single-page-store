import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coupon } from '@/types/coupon';
import { toast } from 'sonner';
import { Loader2, Ticket, X, PartyPopper, Sparkles } from 'lucide-react';

interface CouponInputProps {
  originalAmount: number;
  userId: string;
  userEmail: string;
  onApply: (discount: number, couponId: string, couponCode: string) => void;
  onRemove: () => void;
  appliedCoupon: { code: string; discount: number } | null;
}

const PartyBlast = ({ show }: { show: boolean }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  
  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 100,
        color: ['#22c55e', '#10b981', '#34d399', '#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 8)],
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div key={particle.id} className="absolute animate-ping" style={{
          left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size,
          backgroundColor: particle.color, borderRadius: '50%', animation: `confetti 2s ease-out forwards`,
        }} />
      ))}
      <style>{`@keyframes confetti { 0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); } 100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0); } }`}</style>
    </div>
  );
};

const CouponInput = ({ originalAmount, userId, userEmail, onApply, onRemove, appliedCoupon }: CouponInputProps) => {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showPartyBlast, setShowPartyBlast] = useState(false);

  const handleApplyCoupon = async () => {
    if (!code.trim()) { toast.error('Please enter a coupon code'); return; }
    setIsChecking(true);

    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', code.trim())
        .limit(1);

      if (error || !coupons || coupons.length === 0) {
        toast.error('Invalid coupon code'); setIsChecking(false); return;
      }

      const foundCoupon = coupons[0];

      if (!foundCoupon.is_active) { toast.error('This coupon is no longer active'); setIsChecking(false); return; }
      if ((foundCoupon.used_count || 0) >= (foundCoupon.max_uses || 0)) { toast.error('This coupon has reached its usage limit'); setIsChecking(false); return; }
      
      const usedBy = (foundCoupon.used_by as any) || {};
      if (usedBy[userId]) { toast.error('You have already used this coupon'); setIsChecking(false); return; }
      if (originalAmount < (foundCoupon.min_order || 0)) { toast.error(`Minimum order value is ₹${foundCoupon.min_order}`); setIsChecking(false); return; }

      const discount = Math.round((originalAmount * foundCoupon.discount_value) / 100);
      
      setShowPartyBlast(true);
      setTimeout(() => setShowPartyBlast(false), 2000);
      
      toast.success(
        <div className="flex items-center gap-2">
          <PartyPopper className="h-5 w-5 text-green-500" />
          <div><span className="font-semibold">🎉 Congratulations!</span><span className="ml-1">You saved ₹{discount}!</span></div>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>,
        { duration: 4000, className: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' }
      );
      
      onApply(discount, foundCoupon.id, foundCoupon.code);
      setCode('');
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <PartyBlast show={showPartyBlast} />
      <div className="space-y-3">
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-scale-in">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">{appliedCoupon.code} applied</span>
              <span className="text-sm text-green-600">(-₹{appliedCoupon.discount})</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0 text-green-600 hover:text-red-500">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input placeholder="Enter coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()} />
            <Button variant="outline" onClick={handleApplyCoupon} disabled={isChecking}>
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CouponInput;
