import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { getMainDisplayPricing } from '@/lib/productPricing';
import { getAspectRatioClass } from '@/lib/aspectRatio';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
}

const ProductCard = ({ product, onBuy }: ProductCardProps) => {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const isOutOfStock = !!product.isOutOfStock;
  const mainPricing = getMainDisplayPricing(product);
  const aspectClass = getAspectRatioClass(product.imageAspectRatio);
  
  const hasDiscount = !!(mainPricing.originalPrice && mainPricing.originalPrice > mainPricing.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((mainPricing.originalPrice! - mainPricing.price) / mainPricing.originalPrice!) * 100)
    : 0;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    if (inWishlist) {
      toast.info('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  return (
    <div 
      className={`bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer ${
        isOutOfStock ? 'opacity-80' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className={`relative ${aspectClass} overflow-hidden gradient-card bg-secondary/30`}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover bg-secondary/20 group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold">
            OUT OF STOCK
          </Badge>
        )}
        {product.price === 0 && product.isFreeResource ? (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white font-bold">
            FREE
          </Badge>
        ) : hasDiscount ? (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-bold">
            {discountPercentage}% OFF
          </Badge>
        ) : null}
        <button 
          className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-colors ${
            inWishlist 
              ? 'bg-primary/20 text-primary' 
              : 'bg-background/80 text-muted-foreground hover:text-primary hover:bg-background'
          }`}
          onClick={handleWishlistClick}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-primary' : ''}`} />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          {product.description}
        </p>
        
        <div className="flex items-center gap-2 flex-wrap">
          {product.price === 0 && product.isFreeResource ? (
            <>
              <span className="font-bold text-green-600">FREE</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Free Resource
              </Badge>
            </>
          ) : (
            <>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  Rs. {mainPricing.originalPrice?.toFixed(2)}
                </span>
              )}
              <span className="font-bold text-primary">
                Rs. {mainPricing.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Save {discountPercentage}%
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
