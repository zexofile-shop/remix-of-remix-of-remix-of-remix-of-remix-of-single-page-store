import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react";
import zexofileLogo from "@/assets/zexofile-logo.png";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"
          style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating 404 Numbers */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute text-8xl font-black text-primary/5 select-none animate-float"
              style={{
                left: `${10 + (i * 15)}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            >
              404
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 animate-bounce-slow">
          <img 
            src={zexofileLogo} 
            alt="ZexoFile" 
            className="h-16 w-16 object-contain drop-shadow-2xl"
          />
        </div>

        {/* 404 Text with Glitch Effect */}
        <div className="relative mb-6">
          <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter">
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
                4
              </span>
              <span className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent blur-xl opacity-50">
                4
              </span>
            </span>
            <span className="relative inline-block mx-2">
              <span className="relative z-10 text-primary animate-pulse">
                0
              </span>
              <span className="absolute inset-0 text-primary blur-xl opacity-30">
                0
              </span>
            </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-br from-primary/60 via-primary/80 to-primary bg-clip-text text-transparent animate-gradient-reverse">
                4
              </span>
              <span className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary bg-clip-text text-transparent blur-xl opacity-50">
                4
              </span>
            </span>
          </h1>
          
          {/* Glitch Lines */}
          <div className="absolute inset-0 flex flex-col justify-center pointer-events-none overflow-hidden">
            <div className="h-[2px] bg-primary/30 animate-glitch-1" />
            <div className="h-[1px] bg-primary/20 animate-glitch-2 mt-4" />
            <div className="h-[3px] bg-primary/10 animate-glitch-3 mt-8" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-10 max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 animate-fade-in">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground text-sm md:text-base animate-fade-in delay-100">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry, let's get you back on track!
          </p>
          <div className="mt-4 p-3 bg-secondary/50 rounded-xl border border-border animate-fade-in delay-200">
            <p className="text-xs text-muted-foreground font-mono break-all">
              Requested: <span className="text-primary">{location.pathname}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in delay-300">
          <Button
            size="lg"
            className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
            Go to Homepage
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="group border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="group transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => navigate("/shop")}
          >
            <Search className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
            Browse Shop
          </Button>
        </div>

        {/* Refresh Suggestion */}
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
        >
          <RefreshCw className="h-3 w-3 group-hover:animate-spin" />
          Try refreshing the page
        </button>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground/50">
            © 2024 ZexoFile Shop. All rights reserved.
          </p>
        </div>
      </div>

      {/* Custom Animations Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.03; }
          50% { transform: translateY(-30px) rotate(5deg); opacity: 0.08; }
        }
        
        @keyframes gradient {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(15deg); }
        }
        
        @keyframes gradient-reverse {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(-15deg); }
        }
        
        @keyframes glitch-1 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          10% { transform: translateX(-100%); opacity: 1; }
          20% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes glitch-2 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          15% { transform: translateX(80%); opacity: 1; }
          25% { transform: translateX(-80%); opacity: 0; }
        }
        
        @keyframes glitch-3 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          5% { transform: translateX(-50%); opacity: 1; }
          15% { transform: translateX(50%); opacity: 0; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient { animation: gradient 4s ease-in-out infinite; }
        .animate-gradient-reverse { animation: gradient-reverse 4s ease-in-out infinite; }
        .animate-glitch-1 { animation: glitch-1 3s ease-in-out infinite; }
        .animate-glitch-2 { animation: glitch-2 3.5s ease-in-out infinite; }
        .animate-glitch-3 { animation: glitch-3 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  );
};

export default NotFound;
