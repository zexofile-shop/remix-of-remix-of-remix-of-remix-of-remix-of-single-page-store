import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ref, onValue, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, OrderSubmission, CustomizationFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Tag, Check, Shield, Truck, Gift, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';
import { initiatePayment, hasUserPurchasedProduct } from '@/services/paymentService';
import zexofileLogo from '@/assets/zexofile-logo.png';

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; couponId: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);

  // Get payment type from URL query
  const searchParams = new URLSearchParams(location.search);
  const paymentType = searchParams.get('type') as 'left' | 'right' || 'left';

  useEffect(() => {
    if (!id) return;

    const coursesRef = ref(database, 'courses');
    const websitesRef = ref(database, 'websites');

    let foundProduct: Product | null = null;

    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data[id]) {
        foundProduct = { ...data[id], id, type: 'course' as const };
        setProduct(foundProduct);
        setLoading(false);
      }
    });

    const unsubscribeWebsites = onValue(websitesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data[id]) {
        foundProduct = { ...data[id], id, type: 'website' as const };
        setProduct(foundProduct);
        setLoading(false);
      }
      if (!foundProduct) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeCourses();
      unsubscribeWebsites();
    };
  }, [id]);

  // Check purchase status
  useEffect(() => {
    const checkPurchase = async () => {
      if (user && id) {
        const purchased = await hasUserPurchasedProduct(user.uid, id);
        setAlreadyPurchased(purchased);
      }
    };
    checkPurchase();
  }, [user, id]);

  // Get current pricing based on payment type
  const getCurrentPricing = () => {
    if (!product) return { price: 0, originalPrice: 0, description: '', label: '' };

    if (paymentType === 'right' && product.rightButton) {
      return {
        price: product.rightButton.price,
        originalPrice: product.rightButton.originalPrice || 0,
        description: product.rightButton.description || product.description,
        label: product.rightButton.label || 'Customized Version',
      };
    } else if (paymentType === 'left' && product.leftButton) {
      return {
        price: product.leftButton.price,
        originalPrice: product.leftButton.originalPrice || 0,
        description: product.leftButton.description || product.description,
        label: product.leftButton.label || 'Source Code',
      };
    }
    
    // Fallback to main product price
    return {
      price: product.price,
      originalPrice: product.originalPrice || 0,
      description: product.description,
      label: paymentType === 'right' ? 'Customized Version' : 'Source Code',
    };
  };

  const pricing = getCurrentPricing();
  const subtotal = pricing.price;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

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

      const discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);
      setAppliedCoupon({
        code: coupon.code,
        discount: discountAmount,
        couponId: coupon.id,
      });
      toast.success(`Coupon applied! You save ₹${discountAmount}`);
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

    if (!product) return;

    if (alreadyPurchased) {
      toast.info('You already own this product');
      navigate('/profile');
      return;
    }

    setIsProcessing(true);

    try {
      const couponData = appliedCoupon ? {
        couponId: appliedCoupon.couponId,
        couponCode: appliedCoupon.code,
        discount: appliedCoupon.discount,
      } : undefined;

      // Create a modified product with the correct price for payment
      const paymentProduct = {
        ...product,
        price: pricing.price,
      };

      await initiatePayment(
        paymentProduct,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
        async (purchase) => {
          // Save order submission to Firebase
          const submissionRef = push(ref(database, 'orderSubmissions'));
          const submission: Omit<OrderSubmission, 'id'> = {
            userId: user.uid,
            userEmail: user.email || '',
            userName: user.displayName || '',
            productId: product.id,
            productTitle: product.title,
            productImage: product.image,
            paymentType,
            paymentAmount: total,
            razorpayPaymentId: purchase.razorpayPaymentId,
            status: 'pending',
            createdAt: Date.now(),
          };
          await set(submissionRef, submission);

          // If right button payment and form is enabled, redirect to form page
          if (paymentType === 'right' && product.rightButton?.showForm) {
            toast.success('Payment successful!');
            navigate(`/customization-form/${product.id}?orderId=${submissionRef.key}`);
          } else {
            toast.success('Payment successful! Check your profile for access.');
            navigate('/profile');
          }
          setIsProcessing(false);
        },
        (error) => {
          toast.error(error);
          setIsProcessing(false);
        },
        couponData
      );
    } catch (error) {
      toast.error('Something went wrong');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const hasOriginalDiscount = pricing.originalPrice > pricing.price;
  const savedAmount = hasOriginalDiscount ? pricing.originalPrice - pricing.price : 0;

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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Product Info */}
          <div className="space-y-6">
            {/* Product Card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                className="w-full aspect-video object-contain bg-secondary/30"
              />
              <div className="p-4">
                <Badge className="mb-2">{pricing.label}</Badge>
                <h1 className="text-xl font-bold text-foreground">{product.title}</h1>
                <p className="text-sm text-muted-foreground mt-2">{pricing.description}</p>
              </div>
            </div>

            {/* What You Get */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-3">What You'll Get</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  {paymentType === 'right' ? 'Fully Customized Product' : 'Complete Source Code'}
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  Lifetime Access
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  Free Updates
                </li>
                {paymentType === 'right' && (
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    Personalized Support
                  </li>
                )}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-4 justify-center">
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <div className="text-right">
                    {hasOriginalDiscount && (
                      <span className="text-muted-foreground line-through mr-2">₹{pricing.originalPrice}</span>
                    )}
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                </div>
                {savedAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Product Discount</span>
                    <span className="text-green-600">-₹{savedAmount}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon ({appliedCoupon.code})</span>
                    <span className="text-green-600">-₹{discount}</span>
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
                      <Badge className="bg-green-100 text-green-700 text-xs">-₹{discount}</Badge>
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
                disabled={isProcessing || alreadyPurchased}
              >
                {isProcessing ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Processing...</>
                ) : alreadyPurchased ? (
                  'Already Purchased'
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

export default PaymentPage;
