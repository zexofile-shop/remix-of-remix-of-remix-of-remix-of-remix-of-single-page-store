import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

interface ProductsSectionProps {
  onBuy: (product: Product) => void;
}

const ProductsSection = ({ onBuy }: ProductsSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coursesRef = ref(database, 'courses');
    const websitesRef = ref(database, 'websites');

    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const coursesList: Product[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({
            ...value,
            id,
            type: 'course' as const,
          }))
        : [];
      
      setProducts((prev) => {
        const websites = prev.filter(p => p.type === 'website');
        return [...coursesList, ...websites];
      });
      setLoading(false);
    });

    const unsubscribeWebsites = onValue(websitesRef, (snapshot) => {
      const data = snapshot.val();
      const websitesList: Product[] = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({
            ...value,
            id,
            type: 'website' as const,
          }))
        : [];
      
      setProducts((prev) => {
        const courses = prev.filter(p => p.type === 'course');
        return [...courses, ...websitesList];
      });
    });

    return () => {
      unsubscribeCourses();
      unsubscribeWebsites();
    };
  }, []);

  // Demo products if database is empty
  const demoProducts: Product[] = [
    {
      id: '1',
      title: 'Special Apology Customisable Link',
      description: 'Perfect for saying sorry',
      price: 299.00,
      originalPrice: 399.00,
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
    {
      id: '2',
      title: 'Cute Birthday Wish Customisable Link',
      description: 'Birthday wishes made special',
      price: 299.00,
      image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
    {
      id: '3',
      title: 'Birthday Wish Gift Customisable Link',
      description: 'Make their day memorable',
      price: 449.00,
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
    {
      id: '4',
      title: 'Cute Website Customisable Link',
      description: 'Express your feelings',
      price: 199.00,
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
  ];

  const displayProducts = products.length > 0 ? products : demoProducts;

  return (
    <section id="courses" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Best Selling Products
          </h2>
          <p className="text-muted-foreground">
            People are loving these!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onBuy={onBuy} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full px-8">
            View all
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
