import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Testimonial } from '@/types';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const TestimonialsSlider = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const testimonialsRef = ref(database, 'testimonials');
    const unsubscribe = onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Testimonial[] = data
        ? Object.entries(data)
            .map(([id, value]: [string, any]) => ({ ...value, id }))
            .filter((t) => t.approved)
        : [];
      setTestimonials(list);
    });

    return () => unsubscribe();
  }, []);

  // Demo testimonials if database is empty
  const demoTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Aditi',
      message: 'Absolutely love this product! The quality exceeded my expectations and the customer service was outstanding.',
      rating: 5,
      createdAt: Date.now(),
      approved: true,
    },
    {
      id: '2',
      name: 'Shalini',
      message: 'It was honestly so creative and heart-touching. Felt really special. Thank you so much!',
      rating: 5,
      createdAt: Date.now(),
      approved: true,
    },
    {
      id: '3',
      name: 'Vanya',
      message: 'Highly recommend! Great value for money and the team was so helpful with my questions.',
      rating: 5,
      createdAt: Date.now(),
      approved: true,
    },
    {
      id: '4',
      name: 'Riya',
      message: 'The best digital product I have ever purchased. Worth every rupee spent!',
      rating: 5,
      createdAt: Date.now(),
      approved: true,
    },
    {
      id: '5',
      name: 'Priya',
      message: 'Amazing experience! Quick delivery and excellent quality. Will buy again.',
      rating: 5,
      createdAt: Date.now(),
      approved: true,
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : demoTestimonials;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Customer Reviews
            </h2>
            <p className="text-sm text-muted-foreground">
              What our customers say
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex-shrink-0 w-72 bg-card rounded-xl p-5 shadow-card snap-start"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium text-foreground text-sm">
                    {testimonial.name}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < testimonial.rating
                            ? 'text-gold fill-gold'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                "{testimonial.message}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
