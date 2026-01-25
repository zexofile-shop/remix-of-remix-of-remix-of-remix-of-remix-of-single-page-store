import { Search, CreditCard, Download } from 'lucide-react';

const HowToBuySection = () => {
  const steps = [
    {
      step: '01',
      icon: <Search className="h-8 w-8 text-primary" />,
      title: 'Browse & Select',
      description: 'Explore our collection and choose your perfect product',
    },
    {
      step: '02',
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: 'Secure Payment',
      description: 'Pay securely via Razorpay payment gateway',
    },
    {
      step: '03',
      icon: <Download className="h-8 w-8 text-primary" />,
      title: 'Instant Access',
      description: 'Get immediate access to your digital product',
    },
  ];

  return (
    <section className="py-16 gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            How to Buy
          </h2>
          <p className="text-muted-foreground">
            Simple steps to get your product
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((item, index) => (
            <div
              key={index}
              className="text-center relative animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 right-0 translate-x-1/2 w-12 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToBuySection;
