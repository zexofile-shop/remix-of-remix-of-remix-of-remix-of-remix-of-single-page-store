import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SliderImage {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
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
      buttonText: 'Explore Now',
      buttonLink: '/shop',
      order: 1,
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop',
      title: 'Express Your Love',
      subtitle: 'Turn emotions into a beautiful digital experience',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      order: 2,
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1080&fit=crop',
      title: 'Gift Something Special',
      subtitle: 'A unique present they will never forget',
      buttonText: 'View Products',
      buttonLink: '/shop',
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

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, displaySlides.length]);

  if (displaySlides.length === 0) return null;

  const handleButtonClick = (link?: string) => {
    if (link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        window.location.href = link;
      }
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
      {/* Main Slider Container */}
      <div className="relative w-full max-w-7xl mx-auto">
        {/* Slides */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-b-3xl md:rounded-b-[3rem]">
          {displaySlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex 
                  ? 'opacity-100 translate-x-0' 
                  : index < currentIndex 
                    ? 'opacity-0 -translate-x-full' 
                    : 'opacity-0 translate-x-full'
              }`}
            >
              {/* Image */}
              <img
                src={slide.imageUrl}
                alt={slide.title || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Content Overlay - Below image on mobile, overlay on desktop */}
        <div className="relative md:absolute md:bottom-0 md:left-0 md:right-0 p-6 md:p-12 bg-background md:bg-transparent">
          <div className="max-w-2xl animate-fade-in">
            {displaySlides[currentIndex]?.title && (
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
                {displaySlides[currentIndex].title}
              </h2>
            )}
            {displaySlides[currentIndex]?.subtitle && (
              <p className="text-sm md:text-lg text-muted-foreground mb-6 max-w-lg">
                {displaySlides[currentIndex].subtitle}
              </p>
            )}
            {displaySlides[currentIndex]?.buttonText && (
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:scale-105 transition-transform bg-foreground text-background hover:bg-foreground/90"
                onClick={() => handleButtonClick(displaySlides[currentIndex]?.buttonLink)}
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                {displaySlides[currentIndex].buttonText}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {displaySlides.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 md:left-6 top-1/3 md:top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm border border-border"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 md:right-6 top-1/3 md:top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm border border-border"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {displaySlides.length > 1 && (
        <div className="flex justify-center gap-2 py-6">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-primary w-8 h-3'
                  : 'bg-muted-foreground/30 w-3 h-3 hover:bg-muted-foreground/50'
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
