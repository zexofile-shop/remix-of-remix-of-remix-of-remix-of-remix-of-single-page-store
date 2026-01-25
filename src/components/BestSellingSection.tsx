import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface BestSellingProduct {
  id: string;
  productId: string;
  order: number;
}

interface BestSellingSectionProps {
  onBuy: (product: Product) => void;
}

const BestSellingSection = ({ onBuy }: BestSellingSectionProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellingIds, setBestSellingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch best selling product IDs
    const bestSellingRef = ref(database, 'bestSelling');
    const unsubscribeBestSelling = onValue(bestSellingRef, (snapshot) => {
      const data = snapshot.val();
      const list: BestSellingProduct[] = data
        ? Object.entries(data)
            .map(([id, value]: [string, any]) => ({ ...value, id }))
            .sort((a, b) => a.order - b.order)
        : [];
      setBestSellingIds(list.map(item => item.productId));
    });

    // Fetch all products
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
      unsubscribeBestSelling();
      unsubscribeCourses();
      unsubscribeWebsites();
    };
  }, []);

  // Filter products based on best selling IDs or show first 4 if none selected
  const displayProducts = bestSellingIds.length > 0
    ? products.filter(p => bestSellingIds.includes(p.id)).slice(0, 4)
    : products.slice(0, 4);

  // Demo products if database is empty
  const demoProducts: Product[] = [
    {
      id: '1',
      title: 'Birthday Love Website',
      description: 'A personalized birthday wish website for your loved ones',
      price: 199,
      originalPrice: 299,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
    {
      id: '2',
      title: 'Anniversary Memory Page',
      description: 'Capture your beautiful journey together in a stunning website',
      price: 249,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
    {
      id: '3',
      title: 'Friendship Day Special',
      description: 'Celebrate your bond with a unique friendship website',
      price: 149,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
    {
      id: '4',
      title: 'Valentine\'s Love Letter',
      description: 'Express your love with a romantic digital letter',
      price: 179,
      originalPrice: 249,
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
      type: 'website',
      createdAt: Date.now(),
    },
  ];

  const productsToShow = displayProducts.length > 0 ? displayProducts : demoProducts;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Best Selling Products
          </h2>
          <p className="text-muted-foreground">
            Our most loved creations by customers
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-card">
                <Skeleton className="w-full aspect-[4/3] rounded-xl mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {productsToShow.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} onBuy={onBuy} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 group"
            onClick={() => navigate('/shop')}
          >
            View All Products
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BestSellingSection;
