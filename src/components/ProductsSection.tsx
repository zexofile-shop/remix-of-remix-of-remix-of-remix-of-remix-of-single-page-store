import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { mapProduct } from './BestSellingSection';

interface ProductsSectionProps {
  onBuy: (product: Product) => void;
}

const ProductsSection = ({ onBuy }: ProductsSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts((data || []).map(mapProduct));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <section id="courses" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Best Selling Products</h2>
          <p className="text-muted-foreground">People are loving these!</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onBuy={onBuy} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full px-8">View all</Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
