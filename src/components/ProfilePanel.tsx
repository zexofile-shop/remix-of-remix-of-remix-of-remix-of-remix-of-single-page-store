import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LogOut, User, Shield, ExternalLink } from 'lucide-react';

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

  const handleGoToProfile = () => {
    onClose();
    navigate('/profile');
  };

  const handleGoToAdmin = () => {
    onClose();
    navigate('/admin');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            My Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* User Info */}
          <div className="p-4 bg-secondary/50 rounded-xl">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-medium text-foreground">{user?.email}</p>
            {isAdmin && (
              <span className="inline-block mt-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleGoToProfile}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Profile & Purchases
            </Button>

            {isAdmin && (
              <Button
                className="w-full justify-start bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={handleGoToAdmin}
              >
                <Shield className="h-4 w-4 mr-2" />
                Open Admin Panel
              </Button>
            )}

            <Button
              className="w-full justify-start"
              variant="ghost"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePanel;
