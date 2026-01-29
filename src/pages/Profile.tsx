import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Purchase } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  LogOut, Package, Shield, ArrowLeft, User, Mail, Calendar, 
  ExternalLink, ShoppingBag, Crown
} from 'lucide-react';
import zexofileLogo from '@/assets/zexofile-logo.png';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user purchases
    const purchasesRef = ref(database, 'purchases');
    const unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Purchase[] = data
        ? Object.entries(data)
            .map(([id, value]: [string, any]) => ({ ...value, id }))
            .filter((p: Purchase) => p.userId === user.uid)
            .sort((a, b) => b.purchaseDate - a.purchaseDate)
        : [];
      setPurchases(list);
      setLoading(false);
    });

    return () => unsubscribePurchases();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user) {
    return null;
  }

  const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={zexofileLogo} alt="ZexoFile" className="h-8 w-8 object-contain" />
            <span className="font-semibold text-foreground hidden sm:block">My Profile</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-background p-6 rounded-2xl border border-primary/20 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                {user.displayName || 'User'}
                {isAdmin && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
              {user.metadata?.creationTime && (
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(user.metadata.creationTime).toLocaleDateString()}
                </p>
              )}
            </div>
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                className="bg-primary hover:bg-primary/90"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <p className="text-xl font-bold text-foreground">{purchases.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Package className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-foreground">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchases Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">My Purchases</h2>
            <Badge variant="secondary" className="ml-auto">{purchases.length}</Badge>
          </div>
          
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : purchases.length > 0 ? (
            <div className="divide-y divide-border">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-secondary/30 transition-colors"
                >
                  {purchase.productImage && (
                    <img 
                      src={purchase.productImage} 
                      alt={purchase.productTitle || 'Product'} 
                      className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {purchase.productTitle || `Product #${purchase.productId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{purchase.amount} • {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </p>
                        {purchase.purchaseType && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {purchase.purchaseType === 'customized' ? 'Customized' : 'Source Code'}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {purchase.productType}
                      </Badge>
                    </div>
                    {purchase.razorpayPaymentId && purchase.razorpayPaymentId !== 'FREE_RESOURCE' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Payment ID: {purchase.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                  {purchase.deliveryLink && (
                    <Button 
                      size="sm" 
                      onClick={() => window.open(purchase.deliveryLink, '_blank')}
                      className="w-full sm:w-auto flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Access
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/50 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No purchases yet</p>
              <Button onClick={() => navigate('/shop')}>
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
