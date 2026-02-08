import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSlider from '@/components/HeroSlider';
import BestSellingSection from '@/components/BestSellingSection';
import TestimonialsSlider from '@/components/TestimonialsSlider';
import FeedbackForm from '@/components/FeedbackForm';
import InfoSectionsCompact from '@/components/InfoSectionsCompact';
import Header from '@/components/Header';
import CartModal from '@/components/CartModal';
import AuthModal from '@/components/AuthModal';
import ProfilePanel from '@/components/ProfilePanel';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

const Landing = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleBuy = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Best Selling Products */}
      <BestSellingSection onBuy={handleBuy} />

      {/* Customer Testimonials Slider */}
      <TestimonialsSlider />

      {/* Submit Feedback */}
      <FeedbackForm />

      {/* Compact Info Sections - What we offer, Why choose us, How to buy, Contact */}
      <InfoSectionsCompact />

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
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
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default Landing;

