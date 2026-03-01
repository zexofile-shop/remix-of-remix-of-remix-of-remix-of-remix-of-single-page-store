import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export interface ThemeConfig {
  id: string;
  name: string;
  type: 'seasonal' | 'festival';
  icon: string;
  primaryHsl: string;
  secondaryHsl: string;
  accentHsl: string;
  animation?: string;
}

export const THEMES: ThemeConfig[] = [
  // Default
  { id: 'default', name: 'Default', type: 'seasonal', icon: '✨', primaryHsl: '346 78% 58%', secondaryHsl: '240 5% 96%', accentHsl: '346 78% 58%' },
  // Seasonal
  { id: 'winter', name: 'Winter', type: 'seasonal', icon: '❄️', primaryHsl: '210 80% 55%', secondaryHsl: '210 30% 95%', accentHsl: '200 90% 60%', animation: 'snowfall' },
  { id: 'summer', name: 'Summer', type: 'seasonal', icon: '☀️', primaryHsl: '35 95% 55%', secondaryHsl: '45 60% 95%', accentHsl: '25 100% 55%', animation: 'sunshine' },
  { id: 'spring', name: 'Spring', type: 'seasonal', icon: '🌸', primaryHsl: '330 65% 65%', secondaryHsl: '120 30% 95%', accentHsl: '340 80% 70%', animation: 'petals' },
  { id: 'monsoon', name: 'Monsoon', type: 'seasonal', icon: '🌧️', primaryHsl: '200 60% 50%', secondaryHsl: '200 20% 94%', accentHsl: '190 70% 45%', animation: 'rain' },
  { id: 'autumn', name: 'Autumn', type: 'seasonal', icon: '🍂', primaryHsl: '25 80% 50%', secondaryHsl: '30 40% 94%', accentHsl: '15 85% 55%' },
  // Festivals
  { id: 'diwali', name: 'Diwali', type: 'festival', icon: '🪔', primaryHsl: '40 95% 50%', secondaryHsl: '35 50% 95%', accentHsl: '20 100% 55%', animation: 'sparkle' },
  { id: 'holi', name: 'Holi', type: 'festival', icon: '🎨', primaryHsl: '280 70% 55%', secondaryHsl: '300 30% 95%', accentHsl: '180 80% 50%', animation: 'colors' },
  { id: 'christmas', name: 'Christmas', type: 'festival', icon: '🎄', primaryHsl: '0 75% 45%', secondaryHsl: '120 30% 95%', accentHsl: '120 60% 35%', animation: 'snowfall' },
  { id: 'eid', name: 'Eid', type: 'festival', icon: '🌙', primaryHsl: '150 50% 40%', secondaryHsl: '150 20% 95%', accentHsl: '45 90% 55%' },
  { id: 'makar_sankranti', name: 'Makar Sankranti', type: 'festival', icon: '🪁', primaryHsl: '30 90% 50%', secondaryHsl: '45 50% 95%', accentHsl: '200 80% 55%' },
  { id: 'republic_day', name: 'Republic Day', type: 'festival', icon: '🇮🇳', primaryHsl: '25 90% 50%', secondaryHsl: '120 30% 95%', accentHsl: '120 50% 35%' },
  { id: 'independence_day', name: 'Independence Day', type: 'festival', icon: '🇮🇳', primaryHsl: '25 90% 50%', secondaryHsl: '0 0% 96%', accentHsl: '120 50% 35%' },
  { id: 'valentine', name: "Valentine's Day", type: 'festival', icon: '💝', primaryHsl: '340 85% 55%', secondaryHsl: '340 40% 96%', accentHsl: '350 90% 60%', animation: 'hearts' },
  { id: 'new_year', name: 'New Year', type: 'festival', icon: '🎆', primaryHsl: '260 70% 55%', secondaryHsl: '260 30% 95%', accentHsl: '45 90% 55%', animation: 'sparkle' },
];

interface ThemeContextType {
  activeTheme: string;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: 'default',
  themeConfig: THEMES[0],
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState('default');

  useEffect(() => {
    const themeRef = ref(database, 'siteSettings/activeTheme');
    const unsub = onValue(themeRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setActiveTheme(val);
    });
    return () => unsub();
  }, []);

  const themeConfig = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme !== 'default') {
      root.style.setProperty('--primary', themeConfig.primaryHsl);
      root.style.setProperty('--accent', themeConfig.accentHsl);
      root.style.setProperty('--ring', themeConfig.primaryHsl);
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--ring');
    }
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--ring');
    };
  }, [activeTheme, themeConfig]);

  return (
    <ThemeContext.Provider value={{ activeTheme, themeConfig }}>
      {children}
      {/* Theme animations */}
      {themeConfig.animation && <ThemeAnimation type={themeConfig.animation} />}
    </ThemeContext.Provider>
  );
};

const ThemeAnimation = ({ type }: { type: string }) => {
  useEffect(() => {
    if (type === 'snowfall') {
      createParticles('❄️', 15);
    } else if (type === 'petals') {
      createParticles('🌸', 12);
    } else if (type === 'hearts') {
      createParticles('💖', 10);
    } else if (type === 'sparkle') {
      createParticles('✨', 12);
    } else if (type === 'rain') {
      createRainEffect();
    } else if (type === 'colors') {
      createParticles('🎨', 8);
    } else if (type === 'sunshine') {
      // No particles for sunshine, just warm colors
    }

    return () => {
      const container = document.getElementById('theme-particles');
      if (container) container.remove();
    };
  }, [type]);

  return null;
};

function createParticles(emoji: string, count: number) {
  // Remove existing
  const existing = document.getElementById('theme-particles');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'theme-particles';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const size = 12 + Math.random() * 14;
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * duration;
    
    particle.textContent = emoji;
    particle.style.cssText = `
      position:absolute;
      top:-${size}px;
      left:${left}%;
      font-size:${size}px;
      opacity:${0.4 + Math.random() * 0.4};
      animation:themeParticleFall ${duration}s ${delay}s linear infinite;
      pointer-events:none;
    `;
    container.appendChild(particle);
  }

  // Add animation keyframes
  if (!document.getElementById('theme-particle-style')) {
    const style = document.createElement('style');
    style.id = 'theme-particle-style';
    style.textContent = `
      @keyframes themeParticleFall {
        0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.5; }
        100% { transform: translateY(100vh) rotate(360deg) translateX(${Math.random() > 0.5 ? '' : '-'}50px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function createRainEffect() {
  const existing = document.getElementById('theme-particles');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'theme-particles';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < 30; i++) {
    const drop = document.createElement('div');
    const left = Math.random() * 100;
    const duration = 0.5 + Math.random() * 0.5;
    const delay = Math.random() * 2;

    drop.style.cssText = `
      position:absolute;
      top:-10px;
      left:${left}%;
      width:1.5px;
      height:${12 + Math.random() * 10}px;
      background:linear-gradient(transparent, hsl(200 60% 60% / 0.4));
      border-radius:999px;
      animation:themeRainFall ${duration}s ${delay}s linear infinite;
    `;
    container.appendChild(drop);
  }

  if (!document.getElementById('theme-rain-style')) {
    const style = document.createElement('style');
    style.id = 'theme-rain-style';
    style.textContent = `
      @keyframes themeRainFall {
        0% { transform: translateY(-10px); opacity: 0; }
        20% { opacity: 0.6; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
