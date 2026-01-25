import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section id="home" className="gradient-hero py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Top Banner */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            For any issues, mail at{' '}
            <a href="mailto:bringcashere@gmail.com" className="text-primary hover:underline">
              bringcashere@gmail.com
            </a>
          </p>
        </div>

        {/* Phone Mockups */}
        <div className="flex justify-center items-center gap-4 mb-8 relative">
          <div className="w-32 sm:w-40 md:w-48 animate-float">
            <img
              src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=600&fit=crop"
              alt="App Preview 1"
              className="w-full rounded-3xl shadow-soft"
            />
          </div>
          <div className="w-36 sm:w-44 md:w-52 -mt-8 z-10 animate-float" style={{ animationDelay: '0.5s' }}>
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=600&fit=crop"
              alt="App Preview 2"
              className="w-full rounded-3xl shadow-soft border-4 border-background"
            />
          </div>
          <div className="w-32 sm:w-40 md:w-48 animate-float" style={{ animationDelay: '1s' }}>
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=600&fit=crop"
              alt="App Preview 3"
              className="w-full rounded-3xl shadow-soft"
            />
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            A Personal Website, Made Just for Them
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-2">
            One <span className="text-primary font-medium">beautiful link</span> that holds memories, emotions, and moments
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="w-2 h-2 rounded-full bg-border"></span>
            <span className="w-2 h-2 rounded-full bg-border"></span>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">
            Fully Customizable Links<br />
            For Your Favourite Person
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Turn photos, messages, and emotions into a beautiful personal link. Get Something cool, browse through our collections!
          </p>
          <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold shadow-soft">
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
