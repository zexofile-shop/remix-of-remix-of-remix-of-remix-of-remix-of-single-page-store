import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { CartItem, OrderSubmission } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Tag, Shield, Truck, Gift, Loader2, Trash2, Palette, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';
import { loadRazorpayScript, RAZORPAY_KEY_ID, RazorpayPaymentResponse } from '@/lib/razorpay';
import zexofileLogo from '@/assets/zexofile-logo.png';

const CartCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; couponId: string; percentage: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.percentage) / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  // Count customizable items that need forms
  const customizableItems = cartItems.filter(item => 
    item.selectedOption === 'right' && 
    (item.product.rightButton?.showForm || item.product.allowCustomization)
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const couponsRef = ref(database, 'coupons');
      const snapshot = await new Promise<any>((resolve) => {
        onValue(couponsRef, resolve, { onlyOnce: true });
      });

      const data = snapshot.val();
      if (!data) {
        toast.error('Invalid coupon code');
        setIsApplyingCoupon(false);
        return;
      }

      const coupons = Object.entries(data).map(([id, value]: [string, any]) => ({ ...value, id }));
      const coupon = coupons.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.active);

      if (!coupon) {
        toast.error('Invalid or expired coupon');
        setIsApplyingCoupon(false);
        return;
      }

      if (coupon.usedCount >= coupon.maxUses) {
        toast.error('Coupon usage limit reached');
        setIsApplyingCoupon(false);
        return;
      }

      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        toast.error(`Minimum order value is ₹${coupon.minOrderValue}`);
        setIsApplyingCoupon(false);
        return;
      }

      const discount = Math.round((subtotal * coupon.discountPercent) / 100);
      setAppliedCoupon({
        code: coupon.code,
        discount: discount,
        couponId: coupon.id,
        percentage: coupon.discountPercent,
      });
      toast.success(`🎉 Coupon applied! You save ₹${discount}`);
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePayment = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load payment gateway');
        setIsProcessing(false);
        return;
      }

      const amountInPaise = Math.round(total * 100);
      const itemTitles = cartItems.map(item => item.product.title).join(', ');

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'ZexoFile Shop',
        description: `Cart: ${cartItems.length} item(s)`,
        image: zexofileLogo,
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        notes: {
          cartItems: itemTitles.substring(0, 500),
          userId: user.uid,
          couponCode: appliedCoupon?.code || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async (response: RazorpayPaymentResponse) => {
          console.log('Cart payment success:', response.razorpay_payment_id);
          
          try {
            // Save each cart item as a purchase and order submission
            const orderIds: string[] = [];
            
            for (const item of cartItems) {
              // Save to purchases
              const purchasesRef = ref(database, 'purchases');
              const newPurchaseRef = push(purchasesRef);
              
              // Calculate proportional discount for this item
              const itemDiscount = appliedCoupon 
                ? Math.round((item.price / subtotal) * discountAmount)
                : 0;
              const itemFinalAmount = item.price - itemDiscount;
              
              const purchaseData: any = {
                userId: user.uid,
                userEmail: user.email || '',
                productId: item.product.id,
                productTitle: item.product.title,
                productImage: item.product.image,
                productType: item.product.type,
                deliveryLink: item.product.deliveryLink || item.product.razorpayLink || '',
                amount: itemFinalAmount,
                razorpayPaymentId: response.razorpay_payment_id,
                purchaseDate: Date.now(),
                purchaseType: item.selectedOption,
              };
              
              if (appliedCoupon) {
                purchaseData.originalAmount = item.price;
                purchaseData.couponCode = appliedCoupon.code;
                purchaseData.couponDiscount = itemDiscount;
              }
              
              await set(newPurchaseRef, purchaseData);
              
              // Save order submission
              const submissionRef = push(ref(database, 'orderSubmissions'));
              const submission: Omit<OrderSubmission, 'id'> = {
                userId: user.uid,
                userEmail: user.email || '',
                userName: user.displayName || '',
                productId: item.product.id,
                productTitle: item.product.title,
                productImage: item.product.image,
                paymentType: item.selectedOption,
                paymentAmount: itemFinalAmount,
                razorpayPaymentId: response.razorpay_payment_id,
                status: 'pending',
                createdAt: Date.now(),
              };
              await set(submissionRef, submission);
              
              // Track order IDs for customizable items
              if (item.selectedOption === 'right' && 
                  (item.product.rightButton?.showForm || item.product.allowCustomization)) {
                orderIds.push(`${item.product.id}:${submissionRef.key}`);
              }
            }
            
            // Update coupon usage if applied
            if (appliedCoupon) {
              const couponRef = ref(database, `coupons/${appliedCoupon.couponId}`);
              const couponSnapshot = await new Promise<any>((resolve) => {
                onValue(couponRef, resolve, { onlyOnce: true });
              });
              if (couponSnapshot.exists()) {
                const couponData = couponSnapshot.val();
                await set(couponRef, {
                  ...couponData,
                  usedCount: (couponData.usedCount || 0) + 1,
                  [`usedBy/${user.uid}`]: {
                    email: user.email,
                    usedAt: Date.now(),
                  },
                });
              }
            }
            
            // Clear cart
            clearCart();
            
            toast.success('Payment successful!');
            
            // If there are customizable items, redirect to sequential form
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
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Something went wrong');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onCartClick={() => {}}
          onAuthClick={() => setIsAuthOpen(true)}
          onProfileClick={() => navigate('/profile')}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to checkout</p>
          <Button onClick={() => navigate('/shop')}>Browse Products</Button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCartClick={() => {}}
        onAuthClick={() => setIsAuthOpen(true)}
        onProfileClick={() => navigate('/profile')}
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout ({cartItems.length} items)</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.product.id}-${item.selectedOption}-${index}`} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{item.product.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={`text-xs mt-1 ${item.selectedOption === 'right' ? 'border-purple-500 text-purple-600' : 'border-primary text-primary'}`}
                  >
                    {item.selectedOption === 'right' ? (
                      <><Palette className="h-3 w-3 mr-1" />{item.label}</>
                    ) : (
                      <><CreditCard className="h-3 w-3 mr-1" />{item.label}</>
                    )}
                  </Badge>
                  <p className="text-primary font-bold mt-2">₹{item.price}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            {customizableItems.length > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  📝 {customizableItems.length} item(s) require customization form after payment
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex gap-4 justify-center pt-4">
              <div className="flex flex-col items-center text-center">
                <Shield className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Truck className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Instant Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Gift className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Premium Quality</span>
              </div>
            </div>
          </div>

          {/* Right - Payment Section */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{cartItems.length} item(s)</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon ({appliedCoupon.code})</span>
                    <span className="text-green-600">-₹{discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between py-4 border-b border-border">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-xl text-primary">₹{total}</span>
              </div>

              {/* Coupon Input */}
              <div className="py-4 border-b border-border">
                <label className="text-sm font-medium text-foreground mb-2 block">Coupon Code</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="font-mono font-medium text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">-{appliedCoupon.percentage}%</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-600">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                      {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <Button
                size="lg"
                className="w-full mt-4 py-6 text-base font-semibold"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Processing...</>
                ) : (
                  <><CreditCard className="h-5 w-5 mr-2" />Pay ₹{total}</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default CartCheckout;
