import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, ArrowLeft, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import zexofileLogo from '@/assets/zexofile-logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        await signUp(email, password, name);
        toast.success('Verification link sent! Please check your email to verify your account.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/30 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-8">
            <img src={zexofileLogo} alt="ZexoFile" className="h-24 w-24 object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">ZexoFile Shop</h1>
          <p className="text-xl text-white/80 text-center mb-12 max-w-md">
            Your one-stop destination for premium digital products and custom solutions
          </p>

          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Premium Quality</h3>
                <p className="text-sm text-white/70">Handcrafted digital products</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Made with Love</h3>
                <p className="text-sm text-white/70">Every product is crafted with care</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Instant Delivery</h3>
                <p className="text-sm text-white/70">Get access immediately after purchase</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="lg:hidden flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <img src={zexofileLogo} alt="ZexoFile" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-foreground">ZexoFile Shop</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin 
                  ? 'Sign in to continue shopping' 
                  : 'Join us and start exploring'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="pl-12 h-12 rounded-xl border-2 border-border bg-background focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-12 rounded-xl border-2 border-border bg-background focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-12 h-12 rounded-xl border-2 border-border bg-background focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="text-center text-muted-foreground mt-8">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                className="text-primary hover:underline font-semibold"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
