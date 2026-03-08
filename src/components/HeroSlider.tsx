import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SliderImage {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  sort_order: number;
}

const HeroSlider = () => {
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      setSlides((data || []) as SliderImage[]);
      setLoading(false);
    };
    fetchSlides();
  }, []);

  const displaySlides = slides;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  }, [displaySlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, displaySlides.length]);

  if (loading || displaySlides.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-background mt-4 md:mt-6">
      <div className="relative w-full max-w-7xl mx-auto px-2 md:px-4 lg:px-6">
        <div className="relative w-full aspect-[16/9] sm:aspect-[18/9] md:aspect-[21/9] lg:aspect-[2.5/1] xl:aspect-[2.8/1] overflow-hidden rounded-2xl md:rounded-3xl border-2 border-primary/20 shadow-xl">
          {displaySlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-500 ease-out ${
                index === currentIndex ? 'translate-x-0' : index < currentIndex ? '-translate-x-full' : 'translate-x-full'
              }`}
              style={{ visibility: Math.abs(index - currentIndex) <= 1 ? 'visible' : 'hidden' }}
            >
              <img src={slide.image} alt={slide.title || `Slide ${index + 1}`} className="w-full h-full object-cover md:object-contain lg:object-cover" style={{ objectPosition: 'center' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <div className="relative md:absolute md:bottom-0 md:left-0 md:right-0 p-4 md:p-8 bg-background md:bg-transparent">
          <div className="max-w-2xl">
            {displaySlides[currentIndex]?.title && (
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">{displaySlides[currentIndex].title}</h2>
            )}
            {displaySlides[currentIndex]?.subtitle && (
              <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-lg">{displaySlides[currentIndex].subtitle}</p>
            )}
          </div>
        </div>

        {displaySlides.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-4 md:left-6 top-1/3 md:top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm border border-border" onClick={prevSlide}>
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-4 md:right-6 top-1/3 md:top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm border border-border" onClick={nextSlide}>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </>
        )}
      </div>

      {displaySlides.length > 1 && (
        <div className="flex justify-center gap-2 py-4">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex ? 'bg-primary w-8 h-3' : 'bg-muted-foreground/30 w-3 h-3 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
