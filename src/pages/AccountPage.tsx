import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  LogOut, Package, Shield, ArrowLeft, Mail,
  ExternalLink, ShoppingBag, Crown, Phone, MessageCircle,
  Instagram, Send, Edit3, Check, X, Camera, Sparkles
} from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import zexofileLogo from '@/assets/zexofile-logo.png';

interface UserProfile {
  displayName?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  telegram?: string;
  profilePic?: string;
}

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile>({});
  const [editProfile, setEditProfile] = useState<UserProfile>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const userRef = ref(database, `users/${user.uid}`);
    const unsub = onValue(userRef, (snapshot) => {
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
    return () => unsub();
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
    if (!editProfile.displayName?.trim()) { toast.error('Name is required'); return; }
    if (!editProfile.phone?.trim()) { toast.error('Phone number is required'); return; }

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
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }

    setIsUploadingPic(true);
    try {
      const url = await uploadToImgBB(file);
      await update(ref(database, `users/${user.uid}`), { profilePic: url });
      setProfile(prev => ({ ...prev, profilePic: url }));
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload');
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  const initials = profile.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || 'U';

  // Profile completion
  const completionFields = [
    { done: !!profile.displayName?.trim(), label: 'Name' },
    { done: !!profile.phone?.trim(), label: 'Phone' },
    { done: !!profile.profilePic, label: 'Photo' },
  ];
  const completionPercent = Math.round((completionFields.filter(f => f.done).length / completionFields.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={zexofileLogo} alt="ZexoFile" className="h-8 w-8 object-contain" />
            <span className="font-semibold text-foreground">My Account</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-5">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl border border-primary/20 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20">
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary-foreground">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPic}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
                >
                  {isUploadingPic ? (
                    <div className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-foreground truncate">{profile.displayName || 'User'}</h1>
                  {isAdmin && (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      <Crown className="h-2.5 w-2.5 mr-0.5" />Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" /> {user.email}
                </p>
                {profile.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" /> {profile.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Completion Bar */}
            {completionPercent < 100 && (
              <div className="mt-4 p-3 bg-background/80 rounded-xl border border-border">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Profile Completion</span>
                  <span className="text-xs font-bold text-primary">{completionPercent}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Complete: {completionFields.filter(f => !f.done).map(f => f.label).join(', ')}
                </p>
              </div>
            )}

            {/* Social Links */}
            {!isEditing && (profile.whatsapp || profile.instagram || profile.telegram) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {profile.whatsapp && (
                  <Badge variant="outline" className="text-[10px] gap-1"><MessageCircle className="h-2.5 w-2.5" />{profile.whatsapp}</Badge>
                )}
                {profile.instagram && (
                  <Badge variant="outline" className="text-[10px] gap-1"><Instagram className="h-2.5 w-2.5" />{profile.instagram}</Badge>
                )}
                {profile.telegram && (
                  <Badge variant="outline" className="text-[10px] gap-1"><Send className="h-2.5 w-2.5" />{profile.telegram}</Badge>
                )}
              </div>
            )}

            {/* Edit Form */}
            {isEditing ? (
              <div className="mt-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name *</Label>
                  <Input value={editProfile.displayName || ''} onChange={(e) => setEditProfile(p => ({ ...p, displayName: e.target.value }))} placeholder="Your name" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />Phone *</Label>
                    <Input value={editProfile.phone || ''} onChange={(e) => setEditProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXXXXXXX" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" />WhatsApp</Label>
                    <Input value={editProfile.whatsapp || ''} onChange={(e) => setEditProfile(p => ({ ...p, whatsapp: e.target.value }))} placeholder="WhatsApp" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Instagram className="h-3 w-3" />Instagram</Label>
                    <Input value={editProfile.instagram || ''} onChange={(e) => setEditProfile(p => ({ ...p, instagram: e.target.value }))} placeholder="@username" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Send className="h-3 w-3" />Telegram</Label>
                    <Input value={editProfile.telegram || ''} onChange={(e) => setEditProfile(p => ({ ...p, telegram: e.target.value }))} placeholder="@username" className="mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveProfile} disabled={isSaving} size="sm" className="gap-1">
                    <Check className="h-3.5 w-3.5" />{isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={cancelEditing} variant="outline" size="sm" className="gap-1">
                    <X className="h-3.5 w-3.5" />Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <Button onClick={startEditing} variant="outline" size="sm" className="gap-1 rounded-full text-xs">
                  <Edit3 className="h-3 w-3" /> Edit Profile
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/profile')}
            className="w-full p-4 flex items-center gap-3 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all group text-left"
          >
            <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">My Purchases</p>
              <p className="text-xs text-muted-foreground">View orders & download files</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full p-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/30 transition-all group text-left"
            >
              <div className="p-2.5 bg-primary/15 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Admin Panel</p>
                <p className="text-xs text-muted-foreground">Manage products & orders</p>
              </div>
              <ExternalLink className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
            </button>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full p-4 flex items-center gap-3 rounded-2xl hover:bg-destructive/5 transition-colors group text-left"
        >
          <div className="p-2.5 bg-destructive/10 rounded-xl group-hover:bg-destructive/15 transition-colors">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
