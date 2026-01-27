import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, CreditCard, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Play, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import CartModal from '@/components/CartModal';
import AuthModal from '@/components/AuthModal';
import ProfilePanel from '@/components/ProfilePanel';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import CouponInput from '@/components/CouponInput';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { initiatePayment, hasUserPurchasedProduct, PurchaseRecord } from '@/services/paymentService';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<PurchaseRecord | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; couponId: string } | null>(null);
  
  const inWishlist = id ? isInWishlist(id) : false;
  
  const handleWishlistClick = () => {
    if (id) {
      toggleWishlist(id);
      if (inWishlist) {
        toast.info('Removed from wishlist');
      } else {
        toast.success('Added to wishlist');
      }
    }
  };

  // Check if user has already purchased this product
  useEffect(() => {
    const checkPurchase = async () => {
      if (user && id) {
        const purchased = await hasUserPurchasedProduct(user.uid, id);
        setAlreadyPurchased(purchased);
      }
    };
    checkPurchase();
  }, [user, id]);

  useEffect(() => {
    if (!id) return;
    
    // Try to find product in courses or websites
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
      
      // If still not found after checking both, set loading false
      if (!foundProduct) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeCourses();
      unsubscribeWebsites();
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      setIsAuthOpen(true);
      return;
    }
    
    if (product) {
      setCart((prev) => [...prev, product]);
      toast.success(`${product.title} added to cart!`);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to make a purchase');
      setIsAuthOpen(true);
      return;
    }

    if (!product) return;

    if (alreadyPurchased) {
      toast.info('You have already purchased this product. Check your profile.');
      setIsProfileOpen(true);
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const couponData = appliedCoupon ? {
        couponId: appliedCoupon.couponId,
        couponCode: appliedCoupon.code,
        discount: appliedCoupon.discount,
      } : undefined;

      await initiatePayment(
        product,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
        (purchase) => {
          // Success callback
          setLastPurchase(purchase);
          setShowSuccessModal(true);
          setAlreadyPurchased(true);
          setAppliedCoupon(null); // Reset coupon after purchase
          toast.success('Payment successful!');
          setIsProcessingPayment(false);
        },
        (error) => {
          // Failure callback
          toast.error(error);
          setIsProcessingPayment(false);
        },
        couponData
      );
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleApplyCoupon = (discount: number, couponId: string, couponCode: string) => {
    setAppliedCoupon({ code: couponCode, discount, couponId });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculate final price
  const finalPrice = product ? product.price - (appliedCoupon?.discount || 0) : 0;

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  };

  const hasDiscount = product?.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Screenshot slider navigation
  const screenshots = product?.screenshots || [];
  const allImages = [product?.image, ...screenshots].filter(Boolean) as string[];
  
  const nextScreenshot = () => {
    setCurrentScreenshotIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevScreenshot = () => {
    setCurrentScreenshotIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate('/')}>Go Back Home</Button>
      </div>
    );
  }

  const youtubeVideoId = product.youtubeUrl ? getYouTubeVideoId(product.youtubeUrl) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cart.length}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image with Slider */}
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/30">
                <img
                  src={allImages[currentScreenshotIndex] || product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-lg px-3 py-1">
                  {discountPercentage}% OFF
                </Badge>
              )}
              <button 
                className={`absolute top-4 right-4 p-3 backdrop-blur-sm rounded-full transition-colors ${
                  inWishlist 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-background/80 text-muted-foreground hover:text-primary hover:bg-background'
                }`}
                onClick={handleWishlistClick}
              >
                <Heart className={`h-6 w-6 ${inWishlist ? 'fill-primary' : ''}`} />
              </button>
              
              {/* Navigation arrows for screenshots */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevScreenshot}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextScreenshot}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Screenshot Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreenshotIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentScreenshotIndex 
                        ? 'border-primary' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* YouTube Video */}
            {youtubeVideoId && (
              <div className="mt-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Product Video
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-secondary/30">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title="Product Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-4">
              {product.category && (
                <span className="text-sm text-primary font-medium">{product.category}</span>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                {product.title}
              </h1>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold fill-gold" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.9 rating)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  Rs. {product.originalPrice?.toFixed(2)}
                </span>
              )}
              <span className={`text-3xl font-bold ${appliedCoupon ? 'text-muted-foreground line-through text-xl' : 'text-primary'}`}>
                Rs. {product.price.toFixed(2)}
              </span>
              {appliedCoupon && (
                <span className="text-3xl font-bold text-primary">
                  Rs. {finalPrice.toFixed(2)}
                </span>
              )}
              {hasDiscount && !appliedCoupon && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Save {discountPercentage}%
                </Badge>
              )}
              {appliedCoupon && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Coupon Applied: -{appliedCoupon.discount}
                </Badge>
              )}
            </div>

            {/* Coupon Input - Only show if user is logged in and hasn't purchased */}
            {user && !alreadyPurchased && (
              <div className="mb-6">
                <CouponInput
                  originalAmount={product.price}
                  userId={user.uid}
                  userEmail={user.email || ''}
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  appliedCoupon={appliedCoupon ? { code: appliedCoupon.code, discount: appliedCoupon.discount } : null}
                />
              </div>
            )}

            {/* Already Purchased Badge */}
            {alreadyPurchased && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-400 font-medium text-sm">
                  ✓ You already own this product. Access it from your profile.
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              {product.content && (
                <div className="mt-4 text-muted-foreground whitespace-pre-line">
                  {product.content}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl">
                <Truck className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground text-center">Instant Delivery</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl">
                <Shield className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground text-center">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl">
                <RotateCcw className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground text-center">Lifetime Access</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full py-6 text-base font-semibold gap-3"
                onClick={handleAddToCart}
                disabled={alreadyPurchased}
              >
                <ShoppingCart className="h-6 w-6" />
                {alreadyPurchased ? 'Already Purchased' : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                className="w-full py-6 text-base font-semibold gap-3 bg-primary hover:bg-primary/90"
                onClick={handleBuyNow}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Processing...
                  </>
                ) : alreadyPurchased ? (
                  <>
                    <CreditCard className="h-6 w-6" />
                    View in Profile
                  </>
                ) : (
                  <>
                    <CreditCard className="h-6 w-6" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ZexoFile Shop. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={handleRemoveFromCart}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        purchase={lastPurchase}
        onViewProfile={() => setIsProfileOpen(true)}
      />
    </div>
  );
};

export default ProductDetail;
