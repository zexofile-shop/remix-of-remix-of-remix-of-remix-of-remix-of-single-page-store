import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface BestSellingSectionProps {
  onBuy: (product: Product) => void;
}

const BestSellingSection = ({ onBuy }: BestSellingSectionProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch best selling IDs
      const { data: bestSelling } = await supabase
        .from('best_selling')
        .select('product_id, sort_order')
        .order('sort_order', { ascending: true });

      // Fetch all products
      const { data: allProducts } = await supabase
        .from('products')
        .select('*');

      const mapped = (allProducts || []).map((p: any) => mapProduct(p));

      if (bestSelling && bestSelling.length > 0) {
        const bestIds = bestSelling.map(b => b.product_id);
        const filtered = bestIds
          .map(id => mapped.find(p => p.id === id))
          .filter(Boolean) as Product[];
        setProducts(filtered.slice(0, 4));
      } else {
        setProducts(mapped.slice(0, 4));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Best Selling Products</h2>
          <p className="text-muted-foreground">Our most loved creations by customers</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-card">
                <Skeleton className="w-full aspect-square rounded-xl mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {products.map((product, index) => (
              <div key={product.id} className="animate-slide-up h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard product={product} onBuy={onBuy} uniformSize />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button size="lg" variant="outline" className="rounded-full px-8 group" onClick={() => navigate('/shop')}>
            View All Products
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// Helper to map DB row to Product type
export function mapProduct(p: any): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description || '',
    price: Number(p.price) || 0,
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    image: p.image || '',
    type: p.type || 'course',
    category: p.category || undefined,
    previewLink: p.preview_link || undefined,
    razorpayLink: p.razorpay_link || undefined,
    deliveryLink: p.delivery_link || undefined,
    content: p.content || undefined,
    screenshots: p.screenshots || [],
    youtubeUrl: p.youtube_url || undefined,
    isFreeResource: p.is_free_resource || false,
    allowCustomization: p.allow_customization || false,
    isOutOfStock: p.is_out_of_stock || false,
    buyButtonLabel: p.buy_button_label || undefined,
    displayPriceFrom: p.display_price_from || undefined,
    imageAspectRatio: p.image_aspect_ratio || undefined,
    leftButton: p.left_button || undefined,
    rightButton: p.right_button || undefined,
    createdAt: p.created_at || Date.now(),
  };
}

export default BestSellingSection;
