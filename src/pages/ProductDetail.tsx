import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, CreditCard, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Play, Loader2, Package, Palette } from 'lucide-react';
import Header from '@/components/Header';
import CartModal from '@/components/CartModal';
import CartOptionDialog from '@/components/CartOptionDialog';
import AuthModal from '@/components/AuthModal';
import ProfilePanel from '@/components/ProfilePanel';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { hasUserPurchasedProduct, PurchaseRecord, saveFreeResourceAccess } from '@/services/paymentService';
import { getMainDisplayPricing } from '@/lib/productPricing';
import { getAspectRatioClass } from '@/lib/aspectRatio';


const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addProductToCart, removeFromCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCartOptionDialog, setShowCartOptionDialog] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<PurchaseRecord | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  
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
        setCheckingPurchase(true);
        try {
          const purchased = await hasUserPurchasedProduct(user.uid, id);
          setAlreadyPurchased(purchased);
        } catch (error) {
          console.error('Error checking purchase:', error);
        } finally {
          setCheckingPurchase(false);
        }
      } else {
        setCheckingPurchase(false);
      }
    };
    checkPurchase();
  }, [user, id]);

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

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      setIsAuthOpen(true);
      return;
    }

    if (product?.isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    
    if (product) {
      // Check if product has dual pay options
      const hasDualOptions = !!(product.rightButton || product.allowCustomization);
      
      if (hasDualOptions) {
        // Show cart option dialog for dual-pay products
        setShowCartOptionDialog(true);
      } else {
        // Single option - add directly
        addProductToCart(product, 'left');
        toast.success(`${product.title} added to cart!`);
      }
    }
  };

  const handleCartOptionSelect = (option: 'left' | 'right') => {
    if (!product) return;

    const label =
      option === 'left'
        ? (product.leftButton?.label || 'Source Code')
        : (product.rightButton?.label || 'Get Customized');

    addProductToCart(product, option);
    setShowCartOptionDialog(false);
    toast.success(`${product.title} (${label}) added to cart!`);
  };

  const handlePayment = (type: 'left' | 'right') => {
    if (!user) {
      toast.error('Please login to make a purchase');
      setIsAuthOpen(true);
      return;
    }

    if (!product) return;

    if (product.isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    if (alreadyPurchased) {
      toast.info('You have already purchased this product. Check your profile.');
      navigate('/profile');
      return;
    }

    // Navigate to payment page
    navigate(`/payment/${product.id}?type=${type}`);
  };

  // Handle free resource access
  const handleGetFreeResource = async () => {
    if (!user) {
      toast.error('Please login to access this resource');
      setIsAuthOpen(true);
      return;
    }

    if (!product) return;
    
    setIsProcessingPayment(true);
    try {
      const purchase = await saveFreeResourceAccess(product, user);
      setLastPurchase(purchase);
      setShowSuccessModal(true);
      setAlreadyPurchased(true);
      toast.success('Free resource unlocked!');
    } catch (error) {
      toast.error('Failed to access resource. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // NOTE: main pricing (shown on page) can be configured separately for dual buttons
  const mainPricing = product ? getMainDisplayPricing(product) : null;
  const hasDiscount = !!(mainPricing?.originalPrice && mainPricing.originalPrice > mainPricing.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((mainPricing!.originalPrice! - mainPricing!.price) / mainPricing!.originalPrice!) * 100)
    : 0;

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeVideoId = product?.youtubeUrl ? getYouTubeVideoId(product.youtubeUrl) : null;

  // Build media items array (images + video at the end)
  const screenshots = product?.screenshots || [];
  const allImages = [product?.image, ...screenshots].filter(Boolean) as string[];
  const hasVideo = !!youtubeVideoId;
  const totalMediaItems = allImages.length + (hasVideo ? 1 : 0);
  const isVideoSlide = hasVideo && currentScreenshotIndex === allImages.length;
  
  const nextScreenshot = () => {
    setCurrentScreenshotIndex((prev) => (prev + 1) % totalMediaItems);
  };

  const prevScreenshot = () => {
    setCurrentScreenshotIndex((prev) => (prev - 1 + totalMediaItems) % totalMediaItems);
  };

  // Get pricing info for left and right buttons
  const getLeftPricing = () => {
    if (product?.leftButton) {
      return {
        price: product.leftButton.price,
        originalPrice: product.leftButton.originalPrice,
        label: product.leftButton.label || product?.buyButtonLabel || 'Buy Now',
      };
    }
    return {
      price: product?.price || 0,
      originalPrice: product?.originalPrice,
      label: product?.buyButtonLabel || 'Buy Now',
    };
  };

  const getRightPricing = () => {
    if (product?.rightButton) {
      return {
        price: product.rightButton.price,
        originalPrice: product.rightButton.originalPrice,
        label: product.rightButton.label || 'Get Customized',
      };
    }
    return null;
  };

  const leftPricing = getLeftPricing();
  const rightPricing = getRightPricing();

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

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Product Image/Video Carousel */}
          <div className="space-y-3">
            <div className="relative">
              <div className={`${getAspectRatioClass(product.imageAspectRatio)} rounded-2xl overflow-hidden bg-secondary/30 border border-border`}>
                {isVideoSlide ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
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
                ) : (
                  <img
                    src={allImages[currentScreenshotIndex] || product.image}
                    alt={product.title}
                    className="w-full h-full object-cover bg-secondary/20"
                  />
                )}
              </div>
              {hasDiscount && !isVideoSlide && (
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
              
              {/* Navigation arrows */}
              {totalMediaItems > 1 && (
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

            {/* Thumbnails (including video) - Scrollable container */}
            {totalMediaItems > 1 && (
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentScreenshotIndex(index)}
                      className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
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
                  {hasVideo && (
                    <button
                      onClick={() => setCurrentScreenshotIndex(allImages.length)}
                      className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-black ${
                        isVideoSlide 
                          ? 'border-primary' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Play className="h-5 w-5 md:h-6 md:w-6 text-white fill-white" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-3">
              {product.category && (
                <span className="text-sm text-primary font-medium">{product.category}</span>
              )}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                {product.title}
              </h1>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.9 rating)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {product.price === 0 && product.isFreeResource ? (
                <>
                  <span className="text-2xl font-bold text-green-600">FREE</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Free Resource
                  </Badge>
                </>
              ) : (
                <>
                  {hasDiscount && (
                    <span className="text-lg text-muted-foreground line-through">
                      Rs. {mainPricing?.originalPrice?.toFixed(2)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-primary">
                    Rs. {(mainPricing?.price ?? product.price).toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Save {discountPercentage}%
                    </Badge>
                  )}
                </>
              )}
            </div>

            {/* Already Purchased Badge */}
            {alreadyPurchased && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-400 font-medium text-sm">
                  ✓ You already own this product. Access it from your profile.
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
              {product.content && (
                <div className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                  {product.content}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
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
            <div className="flex flex-col gap-3 mt-auto">
              {checkingPurchase ? (
                <Button size="lg" disabled className="w-full py-6">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Checking...
                </Button>
              ) : alreadyPurchased ? (
                <Button
                  size="lg"
                  className="w-full py-6 text-base font-semibold"
                  onClick={() => navigate('/profile')}
                >
                  <Package className="h-5 w-5 mr-2" />
                  View in Profile
                </Button>
              ) : product.isOutOfStock ? (
                <Button size="lg" disabled className="w-full py-6 text-base font-semibold">
                  Out of Stock
                </Button>
              ) : product.price === 0 && product.isFreeResource ? (
                <Button
                  size="lg"
                  className="w-full py-6 text-base font-semibold bg-green-600 hover:bg-green-700"
                  onClick={handleGetFreeResource}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <><Loader2 className="h-5 w-5 animate-spin mr-2" />Processing...</>
                  ) : (
                    <><ShoppingCart className="h-5 w-5 mr-2" />Get Free Access</>
                  )}
                </Button>
              ) : (
                <>
                  {/* Add to Cart Button - At Top */}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full py-5 text-base font-semibold border-primary text-primary hover:bg-primary/10"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>

                  {/* Dual Pay Buttons */}
                  <div className="flex gap-3">
                    {/* Left Pay Button */}
                    <Button
                      size="lg"
                      className="flex-1 py-6 text-base font-semibold"
                      onClick={() => handlePayment('left')}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm md:text-base">{leftPricing.label}</span>
                        <span className="text-base font-bold opacity-90">₹{leftPricing.price}</span>
                      </div>
                    </Button>

                    {/* Right Pay Button - Only if configured */}
                    {(rightPricing || product.allowCustomization) && (
                      <Button
                        size="lg"
                        variant="secondary"
                        className="flex-1 py-6 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                        onClick={() => handlePayment('right')}
                      >
                        <Palette className="h-4 w-4 mr-1" />
                        <div className="flex flex-col items-start leading-tight">
                          <span className="text-sm md:text-base">{rightPricing?.label || 'Get Customized'}</span>
                          <span className="text-base font-bold opacity-90">₹{rightPricing?.price || product.price}</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </>
              )}
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
        cartItems={cartItems}
        onRemove={removeFromCart}
      />
      <CartOptionDialog
        isOpen={showCartOptionDialog}
        onClose={() => setShowCartOptionDialog(false)}
        product={product}
        onSelectOption={handleCartOptionSelect}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        purchase={lastPurchase}
        onViewProfile={() => navigate('/profile')}
      />
    </div>
  );
};

export default ProductDetail;
