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
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Only show real data from database
  const displaySlides = slides;

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

  // Show nothing while loading or if no slides
  if (loading || displaySlides.length === 0) return null;

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
    <section className="relative w-full overflow-hidden bg-background mt-4 md:mt-6">
      {/* Main Slider Container */}
      <div className="relative w-full max-w-7xl mx-auto px-2 md:px-4 lg:px-6">
        {/* Slides - Fixed aspect ratio for PC, responsive for mobile */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[18/9] md:aspect-[21/9] lg:aspect-[2.5/1] xl:aspect-[2.8/1] overflow-hidden rounded-2xl md:rounded-3xl border-2 border-primary/20 shadow-xl">
          {displaySlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-500 ease-out ${
                index === currentIndex 
                  ? 'translate-x-0' 
                  : index < currentIndex 
                    ? '-translate-x-full' 
                    : 'translate-x-full'
              }`}
              style={{ visibility: Math.abs(index - currentIndex) <= 1 ? 'visible' : 'hidden' }}
            >
              {/* Image - object-contain on larger screens to prevent cutoff */}
              <img
                src={slide.imageUrl}
                alt={slide.title || `Slide ${index + 1}`}
                className="w-full h-full object-cover md:object-contain lg:object-cover"
                style={{ objectPosition: 'center' }}
              />
              
              {/* Very Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Content Overlay - Below image on mobile, overlay on desktop */}
        <div className="relative md:absolute md:bottom-0 md:left-0 md:right-0 p-4 md:p-8 bg-background md:bg-transparent">
          <div className="max-w-2xl">
            {displaySlides[currentIndex]?.title && (
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
                {displaySlides[currentIndex].title}
              </h2>
            )}
            {displaySlides[currentIndex]?.subtitle && (
              <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-lg">
                {displaySlides[currentIndex].subtitle}
              </p>
            )}
            {displaySlides[currentIndex]?.buttonText && (
              <Button
                size="lg"
                className="rounded-full px-6 py-5 text-sm font-semibold shadow-lg hover:scale-105 transition-transform bg-foreground text-background hover:bg-foreground/90"
                onClick={() => handleButtonClick(displaySlides[currentIndex]?.buttonLink)}
              >
                <Play className="h-4 w-4 mr-2 fill-current" />
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
              className="absolute left-4 md:left-6 top-1/3 md:top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm border border-border"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 md:right-6 top-1/3 md:top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm border border-border"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {displaySlides.length > 1 && (
        <div className="flex justify-center gap-2 py-4">
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
