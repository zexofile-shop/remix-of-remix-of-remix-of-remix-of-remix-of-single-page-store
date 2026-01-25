import { Gift, Globe, Palette, Clock, Shield, Heart } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Gift className="h-8 w-8 text-primary" />,
      title: 'Perfect Gift',
      description: 'Unique digital gifts for your loved ones',
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: 'Instant Delivery',
      description: 'Access immediately after purchase',
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: 'Fully Customizable',
      description: 'Personalize every detail to your liking',
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Lifetime Access',
      description: 'Once purchased, access forever',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Secure Payment',
      description: 'Safe and trusted payment gateway',
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Made with Love',
      description: 'Crafted with care and attention',
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            What We Offer
          </h2>
          <p className="text-muted-foreground">
            Why choose our digital products?
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
