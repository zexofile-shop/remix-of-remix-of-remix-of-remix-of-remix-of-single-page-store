import { CheckCircle, Truck, Star } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      value: '5000+',
      label: 'Fulfilled Orders',
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      value: 'Fast & Instant',
      label: 'Delivery',
    },
    {
      icon: <Star className="h-6 w-6 text-gold fill-gold" />,
      value: '4.95',
      label: 'Overall Rating',
      subLabel: 'Based by 800+ customers',
    },
  ];

  return (
    <section className="py-12 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm">
                {stat.label}
              </div>
              {stat.subLabel && (
                <div className="text-muted-foreground text-xs mt-1">
                  {stat.subLabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
