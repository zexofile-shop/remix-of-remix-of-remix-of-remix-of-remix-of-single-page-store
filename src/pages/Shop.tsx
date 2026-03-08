import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CustomProjectForm from '@/components/CustomProjectForm';
import CustomProjectPopup from '@/components/CustomProjectPopup';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SlidersHorizontal, X, Gift, Globe, Palette, Clock, Shield, Heart, CheckCircle, Truck, Star } from 'lucide-react';
import { mapProduct } from '@/components/BestSellingSection';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCustomProjectPopup, setShowCustomProjectPopup] = useState(false);
  const { cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'course' | 'website'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const customProjectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenCustomProjectPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowCustomProjectPopup(true);
        sessionStorage.setItem('hasSeenCustomProjectPopup', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const scrollToCustomProject = () => {
    customProjectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts((data || []).map(mapProduct));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || product.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const handleBuyProduct = (product: Product) => { window.location.href = `/product/${product.id}`; };

  const stats = [
    { icon: <CheckCircle className="h-6 w-6 text-primary" />, value: '5000+', label: 'Fulfilled Orders' },
    { icon: <Truck className="h-6 w-6 text-primary" />, value: 'Fast & Instant', label: 'Delivery' },
    { icon: <Star className="h-6 w-6 text-gold fill-gold" />, value: '4.95', label: 'Overall Rating' },
  ];

  const features = [
    { icon: <Gift className="h-8 w-8 text-primary" />, title: 'Perfect Gift', description: 'Unique digital gifts for loved ones' },
    { icon: <Globe className="h-8 w-8 text-primary" />, title: 'Instant Delivery', description: 'Access immediately after purchase' },
    { icon: <Palette className="h-8 w-8 text-primary" />, title: 'Fully Customizable', description: 'Personalize every detail' },
    { icon: <Clock className="h-8 w-8 text-primary" />, title: 'Lifetime Access', description: 'Once purchased, access forever' },
    { icon: <Shield className="h-8 w-8 text-primary" />, title: 'Secure Payment', description: 'Safe payment gateway' },
    { icon: <Heart className="h-8 w-8 text-primary" />, title: 'Made with Love', description: 'Crafted with care' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartItems.length} onAuthClick={() => setShowAuthModal(true)} />
      <main>
        <section className="gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Digital Products & Custom Projects</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">Explore our collection of beautiful customizable links, courses, and request custom projects tailored just for you!</p>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-background/50 backdrop-blur rounded-xl">
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-6 bg-secondary/30 sticky top-16 z-40 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 rounded-full" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-5 w-5 text-muted-foreground" /></button>}
              </div>
              <Button variant="outline" className="md:hidden rounded-full" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal className="h-5 w-5 mr-2" />Filters</Button>
              <div className="hidden md:flex gap-3">
                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}><SelectTrigger className="w-40 rounded-full"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Products</SelectItem><SelectItem value="website">Websites</SelectItem><SelectItem value="course">Courses</SelectItem></SelectContent></Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}><SelectTrigger className="w-40 rounded-full"><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent><SelectItem value="newest">Newest</SelectItem><SelectItem value="price-low">Price: Low to High</SelectItem><SelectItem value="price-high">Price: High to Low</SelectItem></SelectContent></Select>
              </div>
            </div>
            {showFilters && (
              <div className="md:hidden flex gap-3 mt-4 animate-fade-in">
                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}><SelectTrigger className="flex-1 rounded-full"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Products</SelectItem><SelectItem value="website">Websites</SelectItem><SelectItem value="course">Courses</SelectItem></SelectContent></Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}><SelectTrigger className="flex-1 rounded-full"><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent><SelectItem value="newest">Newest</SelectItem><SelectItem value="price-low">Price: Low to High</SelectItem><SelectItem value="price-high">Price: High to Low</SelectItem></SelectContent></Select>
              </div>
            )}
          </div>
        </section>

        <section id="products" className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl md:text-3xl font-bold text-foreground">All Products</h2><p className="text-muted-foreground">{filteredProducts.length} products found</p></div></div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="bg-muted rounded-2xl h-64 animate-pulse" />)}</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onBuy={handleBuyProduct} />)}</div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4"><Search className="h-10 w-10 text-muted-foreground" /></div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setFilterType('all'); }}>Clear filters</Button>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10"><h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Why Choose Us?</h2></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-card shadow-card">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div ref={customProjectRef}><CustomProjectForm onAuthRequired={() => setShowAuthModal(true)} /></div>
      </main>
      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CustomProjectPopup isOpen={showCustomProjectPopup} onClose={() => setShowCustomProjectPopup(false)} onYes={scrollToCustomProject} />
    </div>
  );
};

export default Index;
