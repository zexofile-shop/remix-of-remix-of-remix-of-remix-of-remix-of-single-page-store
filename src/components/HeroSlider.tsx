import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SliderImage {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  order: number;
}

const HeroSlider = () => {
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slidesRef = ref(database, 'heroSlides');
    const unsubscribe = onValue(slidesRef, (snapshot) => {
      const data = snapshot.val();
      const list: SliderImage[] = data
        ? Object.entries(data)
            .map(([id, value]: [string, any]) => ({ ...value, id }))
            .sort((a, b) => a.order - b.order)
        : [];
      setSlides(list);
    });

    return () => unsubscribe();
  }, []);

  // Demo slides if none exist
  const demoSlides: SliderImage[] = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop',
      title: 'Create Beautiful Memories',
      subtitle: 'Personal websites made just for your loved ones',
      order: 1,
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop',
      title: 'Express Your Love',
      subtitle: 'Turn emotions into a beautiful digital experience',
      order: 2,
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1080&fit=crop',
      title: 'Gift Something Special',
      subtitle: 'A unique present they will never forget',
      order: 3,
    },
  ];

  const displaySlides = slides.length > 0 ? slides : demoSlides;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  }, [displaySlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, displaySlides.length]);

  if (displaySlides.length === 0) return null;

  return (
    <section className="relative w-full aspect-video max-h-[600px] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {displaySlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
            
            {/* Content */}
            {(slide.title || slide.subtitle) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-center">
                {slide.title && (
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2 animate-fade-in">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-sm md:text-lg text-muted-foreground animate-fade-in">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {displaySlides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 backdrop-blur-sm"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 backdrop-blur-sm"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-background/60 hover:bg-background/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
