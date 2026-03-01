import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { THEMES, ThemeConfig } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Sparkles } from 'lucide-react';

const ThemeManager = () => {
  const [activeTheme, setActiveTheme] = useState('default');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const themeRef = ref(database, 'siteSettings/activeTheme');
    const unsub = onValue(themeRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setActiveTheme(val);
    });
    return () => unsub();
  }, []);

  const handleSetTheme = async (themeId: string) => {
    setSaving(true);
    try {
      await update(ref(database, 'siteSettings'), { activeTheme: themeId });
      setActiveTheme(themeId);
      toast.success(`Theme changed to ${THEMES.find(t => t.id === themeId)?.name || themeId}!`);
    } catch (error) {
      toast.error('Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  const seasonalThemes = THEMES.filter(t => t.type === 'seasonal');
  const festivalThemes = THEMES.filter(t => t.type === 'festival');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary" />
          Website Theme
        </h3>
        <p className="text-sm text-muted-foreground">
          Change the look and feel of your website with seasonal and festival themes
        </p>
      </div>

      {/* Currently Active */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">Currently Active</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{THEMES.find(t => t.id === activeTheme)?.icon || '✨'}</span>
          <span className="font-bold text-foreground text-lg">{THEMES.find(t => t.id === activeTheme)?.name || 'Default'}</span>
          {activeTheme !== 'default' && (
            <Button variant="outline" size="sm" className="ml-auto text-xs" onClick={() => handleSetTheme('default')} disabled={saving}>
              Reset to Default
            </Button>
          )}
        </div>
      </div>

      {/* Seasonal Themes */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🌍 Seasonal Themes
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {seasonalThemes.map(theme => (
            <ThemeCard 
              key={theme.id} 
              theme={theme} 
              isActive={activeTheme === theme.id} 
              onSelect={handleSetTheme} 
              disabled={saving}
            />
          ))}
        </div>
      </div>

      {/* Festival Themes */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🎉 Festival Themes
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {festivalThemes.map(theme => (
            <ThemeCard 
              key={theme.id} 
              theme={theme} 
              isActive={activeTheme === theme.id} 
              onSelect={handleSetTheme} 
              disabled={saving}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ThemeCard = ({ theme, isActive, onSelect, disabled }: { 
  theme: ThemeConfig; 
  isActive: boolean; 
  onSelect: (id: string) => void;
  disabled: boolean;
}) => {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      disabled={disabled}
      className={`relative p-4 rounded-2xl border-2 transition-all text-left group ${
        isActive 
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
          : 'border-border hover:border-primary/40 hover:bg-secondary/50'
      }`}
    >
      {isActive && (
        <div className="absolute top-2 right-2 p-1 bg-primary rounded-full">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
      <span className="text-2xl block mb-2">{theme.icon}</span>
      <p className="font-semibold text-sm text-foreground">{theme.name}</p>
      <div className="flex gap-1 mt-2">
        <div className="w-4 h-4 rounded-full border border-border" style={{ background: `hsl(${theme.primaryHsl})` }} />
        <div className="w-4 h-4 rounded-full border border-border" style={{ background: `hsl(${theme.secondaryHsl})` }} />
        <div className="w-4 h-4 rounded-full border border-border" style={{ background: `hsl(${theme.accentHsl})` }} />
      </div>
      {theme.animation && (
        <Badge variant="secondary" className="mt-2 text-[10px]">
          ✨ Animated
        </Badge>
      )}
    </button>
  );
};

export default ThemeManager;
