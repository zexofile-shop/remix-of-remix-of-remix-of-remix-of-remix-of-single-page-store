import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSlider from '@/components/HeroSlider';
import BestSellingSection from '@/components/BestSellingSection';
import TestimonialsSlider from '@/components/TestimonialsSlider';
import FeedbackForm from '@/components/FeedbackForm';
import InfoSectionsCompact from '@/components/InfoSectionsCompact';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

const Landing = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleBuy = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartItems.length}
        onAuthClick={() => setIsAuthOpen(true)}
      />

      <HeroSlider />
      <BestSellingSection onBuy={handleBuy} />
      <TestimonialsSlider />
      <FeedbackForm />
      <InfoSectionsCompact />

      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ZexoFile Shop. All rights reserved.
          </p>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default Landing;
