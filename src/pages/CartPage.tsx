import { useState } from 'react';
import { ShoppingCart, Trash2, Loader2, CreditCard, Palette, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Zap, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartItem, Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import zexofileLogo from '@/assets/zexofile-logo.png';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const customizableCount = cartItems.filter(item =>
    item.selectedOption === 'right' &&
    (item.product.rightButton?.showForm || item.product.allowCustomization)
  ).length;

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      setIsAuthOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/cart-checkout');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={zexofileLogo} alt="ZexoFile" className="h-8 w-8 object-contain" />
            <span className="font-semibold text-foreground">Shopping Cart</span>
          </div>
          {cartItems.length > 0 && (
            <Badge className="bg-primary/15 text-primary border-0">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {cartItems.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-secondary to-secondary/50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Discover amazing digital products</p>
            <Button onClick={() => navigate('/shop')} className="rounded-full px-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedOption}-${index}`}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate text-foreground">{item.product.title}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-1.5 ${item.selectedOption === 'right' ? 'border-purple-500/40 text-purple-600 bg-purple-50/50 dark:bg-purple-900/20' : 'border-primary/40 text-primary bg-primary/5'}`}
                    >
                      {item.selectedOption === 'right' ? (
                        <><Palette className="h-2.5 w-2.5 mr-1" />{item.label}</>
                      ) : (
                        <><CreditCard className="h-2.5 w-2.5 mr-1" />{item.label}</>
                      )}
                    </Badge>
                    <p className="text-primary font-bold mt-1.5 text-base">₹{item.price}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 opacity-60 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => removeFromCart(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Customization Note */}
            {customizableCount > 0 && (
              <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Palette className="h-4 w-4 flex-shrink-0" />
                  {customizableCount} item(s) need customization form after payment
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck className="h-4 w-4 text-green-600" />, text: 'Secure' },
                { icon: <Zap className="h-4 w-4 text-primary" />, text: 'Instant' },
                { icon: <Package className="h-4 w-4 text-blue-600" />, text: 'Guaranteed' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center justify-center gap-1.5 p-2.5 bg-secondary/50 rounded-xl text-xs text-muted-foreground">
                  {badge.icon}
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-foreground">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                <span className="text-foreground">₹{total}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">₹{total}</span>
              </div>
              <Button
                className="w-full rounded-xl py-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Login required to complete your purchase
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default CartPage;
