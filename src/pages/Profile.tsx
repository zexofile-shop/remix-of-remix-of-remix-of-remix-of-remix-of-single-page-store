import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Purchase } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  LogOut, Package, Shield, ArrowLeft, User, Mail, Calendar, 
  ExternalLink, ShoppingBag, Crown, Phone, MessageCircle, 
  Instagram, Send, Edit3, Check, X, Camera, Sparkles
} from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import zexofileLogo from '@/assets/zexofile-logo.png';
import { useRef } from 'react';

interface UserProfile {
  displayName?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  telegram?: string;
  profilePic?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [profile, setProfile] = useState<UserProfile>({});
  const [editProfile, setEditProfile] = useState<UserProfile>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user profile
    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribeProfile = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfile({
          displayName: data.displayName || user.displayName || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          telegram: data.telegram || '',
          profilePic: data.profilePic || '',
        });
      }
    });

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

    return () => {
      unsubscribeProfile();
      unsubscribePurchases();
    };
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const startEditing = () => {
    setEditProfile({ ...profile });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditProfile({});
  };

  const saveProfile = async () => {
    if (!user) return;
    if (!editProfile.displayName?.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editProfile.phone?.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setIsSaving(true);
    try {
      await update(ref(database, `users/${user.uid}`), {
        displayName: editProfile.displayName?.trim(),
        phone: editProfile.phone?.trim(),
        whatsapp: editProfile.whatsapp?.trim() || '',
        instagram: editProfile.instagram?.trim() || '',
        telegram: editProfile.telegram?.trim() || '',
      });
      setProfile({ ...editProfile });
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    setIsUploadingPic(true);
    try {
      const url = await uploadToImgBB(file);
      await update(ref(database, `users/${user.uid}`), { profilePic: url });
      setProfile(prev => ({ ...prev, profilePic: url }));
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload');
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const initials = profile.displayName 
    ? profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : user.email?.charAt(0).toUpperCase() || 'U';

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
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl border border-primary/20 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20">
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPic}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
                >
                  {isUploadingPic ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left w-full">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name *</Label>
                      <Input
                        value={editProfile.displayName || ''}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your name"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone *
                        </Label>
                        <Input
                          value={editProfile.phone || ''}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 XXXXXXXXXX"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </Label>
                        <Input
                          value={editProfile.whatsapp || ''}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                          placeholder="WhatsApp number"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Instagram className="h-3 w-3" /> Instagram
                        </Label>
                        <Input
                          value={editProfile.instagram || ''}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, instagram: e.target.value }))}
                          placeholder="@username"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Send className="h-3 w-3" /> Telegram
                        </Label>
                        <Input
                          value={editProfile.telegram || ''}
                          onChange={(e) => setEditProfile(prev => ({ ...prev, telegram: e.target.value }))}
                          placeholder="@username"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <Button onClick={saveProfile} disabled={isSaving} size="sm" className="gap-1">
                        <Check className="h-3.5 w-3.5" /> {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" size="sm" className="gap-1">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-xl font-bold text-foreground">
                        {profile.displayName || 'User'}
                      </h1>
                      {isAdmin && (
                        <Badge className="bg-primary text-primary-foreground text-[10px]">
                          <Crown className="h-3 w-3 mr-1" />Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                      <Mail className="h-3 w-3" /> {user.email}
                    </p>
                    {profile.phone && (
                      <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {profile.phone}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2 justify-center sm:justify-start">
                      {profile.whatsapp && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {profile.whatsapp}
                        </span>
                      )}
                      {profile.instagram && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Instagram className="h-3 w-3" /> {profile.instagram}
                        </span>
                      )}
                      {profile.telegram && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Send className="h-3 w-3" /> {profile.telegram}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                      <Button onClick={startEditing} variant="outline" size="sm" className="gap-1 rounded-full text-xs">
                        <Edit3 className="h-3 w-3" /> Edit Profile
                      </Button>
                      {isAdmin && (
                        <Button onClick={() => navigate('/admin')} size="sm" className="gap-1 rounded-full text-xs">
                          <Shield className="h-3 w-3" /> Admin Panel
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Purchases</p>
                <p className="text-xl font-bold text-foreground">{purchases.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Package className="h-5 w-5 text-primary" />
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
          <div className="p-4 border-b border-border flex items-center gap-2 bg-secondary/30">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
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
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors"
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
                            {purchase.purchaseType === 'customized' || purchase.purchaseType === 'right' ? 'Customized' : 'Source Code'}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
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
                      className="w-full sm:w-auto flex-shrink-0 rounded-full"
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
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-secondary to-secondary/50 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No purchases yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start exploring our digital products</p>
              <Button onClick={() => navigate('/shop')} className="rounded-full gap-2">
                <Sparkles className="h-4 w-4" />
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
