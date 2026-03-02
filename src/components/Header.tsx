import { Menu, X, ShoppingCart, User, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import zexofileLogo from '@/assets/zexofile-logo.png';

const UserProfileAvatar = ({ user, size = 'sm' }: { user: any; size?: 'sm' | 'md' }) => {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onValue(ref(database, `users/${user.uid}/profilePic`), (snap) => {
      setProfilePic(snap.val() || null);
    });
    return () => unsub();
  }, [user?.uid]);

  const s = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const initials = user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  if (profilePic) {
    return <img src={profilePic} alt="Profile" className={`${s} rounded-full object-cover`} />;
  }
  return (
    <div className={`${s} rounded-full bg-primary flex items-center justify-center`}>
      <span className="text-xs font-bold text-primary-foreground">{initials}</span>
    </div>
  );
};

interface HeaderProps {
  cartCount?: number;
  onAuthClick: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
}

const Header = ({ cartCount = 0, onAuthClick, onCartClick, onProfileClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'What We Offer', href: '#what-we-offer' },
    { label: 'How to Buy', href: '#how-to-buy' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleAuthClick = () => {
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src={zexofileLogo} alt="ZexoFile Shop" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-foreground">ZexoFile Shop</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Admin Panel Button - Only for admin */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/admin')}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>
            
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/account')}
                className="relative"
              >
                <UserProfileAvatar user={user} size="sm" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={handleAuthClick}
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {isAdmin && (
                <button
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 text-left flex items-center gap-2"
                  onClick={() => {
                    navigate('/admin');
                    setIsMenuOpen(false);
                  }}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
