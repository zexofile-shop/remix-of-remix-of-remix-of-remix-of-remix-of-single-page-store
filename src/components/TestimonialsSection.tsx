import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Testimonial } from '@/types';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

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
      message: 'It was honestly so creative and heart-touching. felt really special. Thank you so much for putting your effort into making it so adorable.',
      rating: 5,
      createdAt: Date.now(),
      approved: true,
    },
    {
      id: '3',
      name: 'Vanya',
      message: 'Highly recommend! Great value for money and Pinakk was so helpful with my questions.',
      rating: 5,
      createdAt: Date.now(),
      approved: true,
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : demoTestimonials;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Customer Testimonials
          </h2>
          <p className="text-muted-foreground">
            Some reviews from our recent customers
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-secondary/30 rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card rounded-xl p-4 mb-4 shadow-card">
                <p className="text-foreground text-sm leading-relaxed">
                  {testimonial.message}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-gold fill-gold'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {testimonial.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
