import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LogOut, User, Shield, ExternalLink, ShoppingBag, Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePanel = ({ isOpen, onClose }: ProfilePanelProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
    toast.success('Logged out successfully');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-gradient-to-br from-primary/15 via-primary/8 to-transparent p-6 pb-5">
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">My Account</span>
            </div>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-lg font-bold text-primary-foreground">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {isAdmin && (
                <Badge className="mt-1.5 bg-primary/15 text-primary border-0 text-[10px] px-2 py-0.5">
                  <Crown className="h-2.5 w-2.5 mr-1" />Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 pt-2 space-y-2">
          <button onClick={() => { onClose(); navigate('/profile'); }} className="w-full p-3.5 flex items-center gap-3 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border transition-all group text-left">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors"><ShoppingBag className="h-4 w-4 text-primary" /></div>
            <div className="flex-1"><p className="font-medium text-sm text-foreground">My Purchases</p><p className="text-[11px] text-muted-foreground">View orders & download files</p></div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          {isAdmin && (
            <button onClick={() => { onClose(); navigate('/admin'); }} className="w-full p-3.5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border border-primary/20 hover:border-primary/30 transition-all group text-left">
              <div className="p-2 bg-primary/15 rounded-xl group-hover:bg-primary/20 transition-colors"><Shield className="h-4 w-4 text-primary" /></div>
              <div className="flex-1"><p className="font-medium text-sm text-foreground">Admin Panel</p><p className="text-[11px] text-muted-foreground">Manage products & orders</p></div>
              <ExternalLink className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors" />
            </button>
          )}
          <div className="pt-1">
            <button onClick={handleLogout} className="w-full p-3 flex items-center gap-3 rounded-2xl hover:bg-destructive/5 transition-colors group text-left">
              <div className="p-2 bg-destructive/10 rounded-xl group-hover:bg-destructive/15 transition-colors"><LogOut className="h-4 w-4 text-destructive" /></div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-destructive transition-colors">Logout</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePanel;
