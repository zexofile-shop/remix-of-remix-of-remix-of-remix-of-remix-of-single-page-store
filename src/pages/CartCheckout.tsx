import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { CartItem, OrderSubmission } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, CreditCard, Tag, Shield, Truck, Gift, Loader2, Trash2, 
  Palette, ShoppingBag, Sparkles, CheckCircle2, PartyPopper, Lock
} from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';
import { loadRazorpayScript, RAZORPAY_KEY_ID, RazorpayPaymentResponse } from '@/lib/razorpay';
import zexofileLogo from '@/assets/zexofile-logo.png';
import confetti from 'canvas-confetti';

const CartCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const profileCompletion = useProfileCompletion();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; couponId: string; percentage: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.percentage) / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const customizableItems = cartItems.filter(item => 
    item.selectedOption === 'right' && (item.product.rightButton?.showForm || item.product.allowCustomization)
  );

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { x: 0.1, y: 0.6 }, colors: ['#22c55e', '#16a34a', '#86efac', '#4ade80'] });
    confetti({ particleCount: 100, spread: 70, origin: { x: 0.9, y: 0.6 }, colors: ['#22c55e', '#16a34a', '#86efac', '#4ade80'] });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Please enter a coupon code'); return; }
    setIsApplyingCoupon(true);
    try {
      const { data: coupons } = await supabase.from('coupons').select('*').eq('is_active', true);
      const coupon = (coupons || []).find((c: any) => c.code.toLowerCase() === couponCode.trim().toLowerCase());
      if (!coupon) { toast.error('Invalid or expired coupon'); setIsApplyingCoupon(false); return; }
      if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) { toast.error('Coupon usage limit reached'); setIsApplyingCoupon(false); return; }
      if (coupon.min_order && subtotal < Number(coupon.min_order)) { toast.error(`Minimum order value is ₹${coupon.min_order}`); setIsApplyingCoupon(false); return; }

      const pct = coupon.discount_type === 'percentage' ? Number(coupon.discount_value) : Math.round((Number(coupon.discount_value) / subtotal) * 100);
      const disc = Math.round((subtotal * pct) / 100);
      setAppliedCoupon({ code: coupon.code, discount: disc, couponId: coupon.id, percentage: pct });
      triggerConfetti();
      toast.success(`🎉 Coupon applied! You save ₹${disc}`);
    } catch { toast.error('Failed to apply coupon'); }
    finally { setIsApplyingCoupon(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  const handlePayment = async () => {
    if (!user) { setIsAuthOpen(true); return; }
    if (!profileCompletion.isComplete) {
      toast.error(`Please complete your profile first (${profileCompletion.percent}% done). Missing: ${profileCompletion.missing.join(', ')}`);
      navigate('/account'); return;
    }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }

    setIsProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) { toast.error('Failed to load payment gateway'); setIsProcessing(false); return; }

      const amountInPaise = Math.round(total * 100);
      const displayName = user.user_metadata?.full_name || '';

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'ZexoFile Shop',
        description: `Cart: ${cartItems.length} item(s)`,
        image: zexofileLogo,
        prefill: { name: displayName, email: user.email || '' },
        notes: { cartItems: cartItems.map(item => item.product.title).join(', ').substring(0, 500), userId: user.id, couponCode: appliedCoupon?.code || '' },
        theme: { color: '#6366f1' },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const orderIds: string[] = [];
            for (const item of cartItems) {
              const itemDiscount = appliedCoupon ? Math.round((item.price / subtotal) * discountAmount) : 0;
              const itemFinalAmount = item.price - itemDiscount;

              const purchaseData: any = {
                user_id: user.id, user_email: user.email || '',
                product_id: item.product.id, product_title: item.product.title,
                product_image: item.product.image, product_type: item.product.type,
                delivery_link: item.product.deliveryLink || item.product.razorpayLink || '',
                amount: itemFinalAmount, razorpay_payment_id: response.razorpay_payment_id,
                purchase_date: Date.now(), purchase_type: item.selectedOption,
              };
              if (appliedCoupon) {
                purchaseData.original_amount = item.price;
                purchaseData.coupon_code = appliedCoupon.code;
                purchaseData.coupon_discount = itemDiscount;
              }
              await supabase.from('purchases').insert(purchaseData);

              const { data: submission } = await supabase.from('order_submissions').insert({
                user_id: user.id, user_email: user.email || '', user_name: displayName,
                product_id: item.product.id, product_title: item.product.title,
                product_image: item.product.image, payment_type: item.selectedOption,
                payment_amount: itemFinalAmount, razorpay_payment_id: response.razorpay_payment_id,
                status: 'pending', created_at: Date.now(),
              }).select('id').single();

              if (item.selectedOption === 'right' && (item.product.rightButton?.showForm || item.product.allowCustomization) && submission) {
                orderIds.push(`${item.product.id}:${submission.id}`);
              }
            }

            if (appliedCoupon) {
              const { data: coupon } = await supabase.from('coupons').select('used_count, used_by').eq('id', appliedCoupon.couponId).single();
              if (coupon) {
                const usedBy = (coupon.used_by as Record<string, any>) || {};
                usedBy[user.id] = { email: user.email || '', usedAt: Date.now() };
                await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1, used_by: usedBy }).eq('id', appliedCoupon.couponId);
              }
            }

            clearCart();
            toast.success('Payment successful!');

            if (orderIds.length > 0) {
              sessionStorage.setItem('pendingForms', JSON.stringify(orderIds));
              sessionStorage.setItem('currentFormIndex', '0');
              const [productId, orderId] = orderIds[0].split(':');
              navigate(`/customization-form/${productId}?orderId=${orderId}&total=${orderIds.length}&current=1`);
            } else {
              navigate('/profile');
            }
          } catch (error) {
            console.error('Failed to save purchases:', error);
            toast.error('Payment successful but failed to save. Please contact support.');
          }
          setIsProcessing(false);
        },
        modal: { ondismiss: () => { setIsProcessing(false); } },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch { toast.error('Something went wrong'); setIsProcessing(false); }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartClick={() => {}} onAuthClick={() => setIsAuthOpen(true)} onProfileClick={() => navigate('/profile')} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6"><ShoppingBag className="h-12 w-12 text-primary" /></div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Explore our collection and find something you'll love!</p>
          <Button onClick={() => navigate('/shop')} size="lg" className="gap-2"><Sparkles className="h-4 w-4" />Browse Products</Button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <Header onCartClick={() => {}} onAuthClick={() => setIsAuthOpen(true)} onProfileClick={() => navigate('/profile')} />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" className="mb-4 gap-2 hover:bg-secondary/50" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Back to Shopping</Button>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary mb-2"><Sparkles className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wider">Secure Checkout</span></div>
          <h1 className="text-3xl font-bold text-foreground">Complete Your Order</h1>
          <p className="text-muted-foreground mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart • Instant digital delivery</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30"><h2 className="font-semibold text-foreground flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-primary" />Order Items</h2></div>
              <div className="divide-y divide-border">
                {cartItems.map((item, index) => (
                  <div key={`${item.product.id}-${item.selectedOption}-${index}`} className="p-4 flex gap-4 hover:bg-secondary/20 transition-colors">
                    <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.product.title}</h3>
                      <Badge variant="outline" className={`text-xs mt-2 ${item.selectedOption === 'right' ? 'border-purple-500/50 text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-primary/50 text-primary bg-primary/5'}`}>
                        {item.selectedOption === 'right' ? <><Palette className="h-3 w-3 mr-1" />{item.label}</> : <><CreditCard className="h-3 w-3 mr-1" />{item.label}</>}
                      </Badge>
                      <p className="text-primary font-bold text-lg mt-2">₹{item.price}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(index)} className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
            {customizableItems.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-2xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg"><Palette className="h-5 w-5 text-purple-600" /></div><div><p className="font-semibold text-purple-700 dark:text-purple-400">Customization Required</p><p className="text-sm text-purple-600 dark:text-purple-500 mt-0.5">{customizableItems.length} {customizableItems.length === 1 ? 'item requires' : 'items require'} a customization form after payment</p></div></div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border"><div className="p-2 bg-primary/10 rounded-lg mb-2"><Shield className="h-5 w-5 text-primary" /></div><span className="text-xs font-medium text-foreground">Secure Payment</span><span className="text-[10px] text-muted-foreground">256-bit SSL</span></div>
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border"><div className="p-2 bg-primary/10 rounded-lg mb-2"><Truck className="h-5 w-5 text-primary" /></div><span className="text-xs font-medium text-foreground">Instant Delivery</span><span className="text-[10px] text-muted-foreground">Digital access</span></div>
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border"><div className="p-2 bg-primary/10 rounded-lg mb-2"><Gift className="h-5 w-5 text-primary" /></div><span className="text-xs font-medium text-foreground">Premium Quality</span><span className="text-[10px] text-muted-foreground">100% authentic</span></div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-6">
              <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10"><h2 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Order Summary</h2></div>
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span><span className="font-medium text-foreground">₹{subtotal}</span></div>
                  {appliedCoupon && <div className="flex justify-between text-sm"><span className="text-green-600 flex items-center gap-1"><Tag className="h-3 w-3" />Discount ({appliedCoupon.percentage}%)</span><span className="text-green-600 font-medium">-₹{discountAmount}</span></div>}
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center"><span className="font-bold text-foreground">Total</span><div className="text-right">{appliedCoupon && <span className="text-sm text-muted-foreground line-through mr-2">₹{subtotal}</span>}<span className="font-bold text-2xl text-primary">₹{total}</span></div></div>
                <div className="h-px bg-border" />
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />Have a coupon code?</label>
                  {appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="font-mono font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</span></div>
                        <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 px-2">Remove</Button>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400"><PartyPopper className="h-4 w-4" /><span className="text-sm font-medium">Congratulations! You're saving ₹{discountAmount} 🎉</span></div>
                    </div>
                  ) : (
                    <div className="flex gap-2"><Input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 font-mono" /><Button onClick={handleApplyCoupon} disabled={isApplyingCoupon} variant="outline">{isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}</Button></div>
                  )}
                </div>
                <div className="h-px bg-border" />
                <Button size="lg" className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25" onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Processing...</> : <><Lock className="h-4 w-4 mr-2" />Pay Securely ₹{total}</>}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Lock className="h-3 w-3" /><span>Secure payment powered by Razorpay</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default CartCheckout;
