import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Purchase } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LogOut, Package, Shield } from 'lucide-react';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePanel = ({ isOpen, onClose }: ProfilePanelProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch user purchases
    const purchasesRef = ref(database, 'purchases');
    const unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Purchase[] = data
        ? Object.entries(data)
            .map(([id, value]: [string, any]) => ({ ...value, id }))
        : [];
      setPurchases(list.filter((p) => p.userId === user.uid));
    });

    return () => unsubscribePurchases();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    onClose();
    toast.success('Logged out successfully');
  };

  const handleGoToAdmin = () => {
    onClose();
    navigate('/admin');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>My Profile</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* User Info */}
          <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-medium">{user?.email}</p>
            {isAdmin && (
              <span className="inline-block mt-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Admin Panel Button */}
          {isAdmin && (
            <Button
              className="w-full mb-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              onClick={handleGoToAdmin}
            >
              <Shield className="h-4 w-4 mr-2" />
              Open Admin Panel
            </Button>
          )}

          {/* User Purchases */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              My Purchases
            </h3>
            {purchases.length > 0 ? (
              <div className="space-y-3">
                {purchases.map((purchase: any) => (
                  <div
                    key={purchase.id}
                    className="p-4 bg-secondary/30 rounded-lg flex items-center gap-4"
                  >
                    {purchase.productImage && (
                      <img 
                        src={purchase.productImage} 
                        alt={purchase.productTitle || 'Product'} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{purchase.productTitle || `Product #${purchase.productId}`}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{purchase.amount} • {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                      {purchase.razorpayPaymentId && (
                        <p className="text-xs text-muted-foreground">
                          Payment ID: {purchase.razorpayPaymentId}
                        </p>
                      )}
                    </div>
                    {purchase.deliveryLink && (
                      <Button 
                        size="sm" 
                        onClick={() => window.open(purchase.deliveryLink, '_blank')}
                        className="flex-shrink-0"
                      >
                        Access
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8 bg-secondary/20 rounded-xl">
                No purchases yet. Start shopping!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePanel;