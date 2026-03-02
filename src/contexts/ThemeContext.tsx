import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
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
  { id: 'default', name: 'Default', type: 'seasonal', icon: '✨', primaryHsl: '346 78% 58%', secondaryHsl: '240 5% 96%', accentHsl: '346 78% 58%' },
  { id: 'winter', name: 'Winter', type: 'seasonal', icon: '❄️', primaryHsl: '210 80% 55%', secondaryHsl: '210 30% 95%', accentHsl: '200 90% 60%', animation: 'snowfall' },
  { id: 'summer', name: 'Summer', type: 'seasonal', icon: '☀️', primaryHsl: '35 95% 55%', secondaryHsl: '45 60% 95%', accentHsl: '25 100% 55%', animation: 'sunshine' },
  { id: 'spring', name: 'Spring', type: 'seasonal', icon: '🌸', primaryHsl: '330 65% 65%', secondaryHsl: '120 30% 95%', accentHsl: '340 80% 70%', animation: 'petals' },
  { id: 'monsoon', name: 'Monsoon', type: 'seasonal', icon: '🌧️', primaryHsl: '200 60% 50%', secondaryHsl: '200 20% 94%', accentHsl: '190 70% 45%', animation: 'rain' },
  { id: 'autumn', name: 'Autumn', type: 'seasonal', icon: '🍂', primaryHsl: '25 80% 50%', secondaryHsl: '30 40% 94%', accentHsl: '15 85% 55%' },
  { id: 'diwali', name: 'Diwali', type: 'festival', icon: '🪔', primaryHsl: '40 95% 50%', secondaryHsl: '35 50% 95%', accentHsl: '20 100% 55%', animation: 'sparkle' },
  { id: 'holi', name: 'Holi', type: 'festival', icon: '🎨', primaryHsl: '280 70% 55%', secondaryHsl: '300 30% 95%', accentHsl: '180 80% 50%', animation: 'holi' },
  { id: 'christmas', name: 'Christmas', type: 'festival', icon: '🎄', primaryHsl: '0 75% 45%', secondaryHsl: '120 30% 95%', accentHsl: '120 60% 35%', animation: 'snowfall' },
  { id: 'eid', name: 'Eid', type: 'festival', icon: '🌙', primaryHsl: '150 50% 40%', secondaryHsl: '150 20% 95%', accentHsl: '45 90% 55%', animation: 'sparkle' },
  { id: 'makar_sankranti', name: 'Makar Sankranti', type: 'festival', icon: '🪁', primaryHsl: '30 90% 50%', secondaryHsl: '45 50% 95%', accentHsl: '200 80% 55%', animation: 'kites' },
  { id: 'republic_day', name: 'Republic Day', type: 'festival', icon: '🇮🇳', primaryHsl: '25 90% 50%', secondaryHsl: '120 30% 95%', accentHsl: '120 50% 35%' },
  { id: 'independence_day', name: 'Independence Day', type: 'festival', icon: '🇮🇳', primaryHsl: '25 90% 50%', secondaryHsl: '0 0% 96%', accentHsl: '120 50% 35%' },
  { id: 'valentine', name: "Valentine's Day", type: 'festival', icon: '💝', primaryHsl: '340 85% 55%', secondaryHsl: '340 40% 96%', accentHsl: '350 90% 60%', animation: 'hearts' },
  { id: 'new_year', name: 'New Year', type: 'festival', icon: '🎆', primaryHsl: '260 70% 55%', secondaryHsl: '260 30% 95%', accentHsl: '45 90% 55%', animation: 'fireworks' },
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
      {themeConfig.animation && <ThemeAnimation type={themeConfig.animation} config={themeConfig} />}
    </ThemeContext.Provider>
  );
};

// ===== Realistic Theme Animations =====

const ThemeAnimation = ({ type, config }: { type: string; config: ThemeConfig }) => {
  useEffect(() => {
    const cleanup = initAnimation(type, config);
    return () => {
      cleanup();
      const container = document.getElementById('theme-particles');
      if (container) container.remove();
      const style = document.getElementById('theme-anim-style');
      if (style) style.remove();
    };
  }, [type, config]);

  return null;
};

function getContainer(): HTMLDivElement {
  const existing = document.getElementById('theme-particles') as HTMLDivElement;
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'theme-particles';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);
  return container;
}

function addStyle(id: string, css: string) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function initAnimation(type: string, config: ThemeConfig): () => void {
  switch (type) {
    case 'snowfall': return createSnowfall();
    case 'rain': return createRain();
    case 'petals': return createPetals();
    case 'hearts': return createHearts();
    case 'sparkle': return createSparkle(config);
    case 'holi': return createHoli();
    case 'fireworks': return createFireworks(config);
    case 'kites': return createKites();
    case 'sunshine': return createSunshine();
    default: return () => {};
  }
}

// ---- SNOWFALL: realistic white/blue circles ----
function createSnowfall(): () => void {
  const container = getContainer();
  addStyle('theme-anim-style', `
    @keyframes snowDrift {
      0% { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.8; }
      100% { transform: translateY(100vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
    }
  `);

  for (let i = 0; i < 40; i++) {
    const flake = document.createElement('div');
    const size = 3 + Math.random() * 6;
    const drift = (Math.random() - 0.5) * 100;
    flake.style.cssText = `
      position:absolute;top:-10px;left:${Math.random()*100}%;
      width:${size}px;height:${size}px;
      background:radial-gradient(circle, rgba(255,255,255,0.9), rgba(200,220,255,0.4));
      border-radius:50%;
      --drift:${drift}px;
      animation:snowDrift ${5+Math.random()*8}s ${Math.random()*5}s linear infinite;
      filter:blur(${Math.random() > 0.7 ? 1 : 0}px);
    `;
    container.appendChild(flake);
  }
  return () => {};
}

// ---- RAIN: thin streaks ----
function createRain(): () => void {
  const container = getContainer();
  addStyle('theme-anim-style', `
    @keyframes rainDrop {
      0% { transform: translateY(-20px) rotate(15deg); opacity: 0; }
      15% { opacity: 0.5; }
      100% { transform: translateY(100vh) rotate(15deg); opacity: 0; }
    }
  `);

  for (let i = 0; i < 60; i++) {
    const drop = document.createElement('div');
    drop.style.cssText = `
      position:absolute;top:-20px;left:${Math.random()*100}%;
      width:1.5px;height:${15+Math.random()*20}px;
      background:linear-gradient(transparent, hsl(200 70% 65% / 0.5));
      border-radius:999px;
      animation:rainDrop ${0.4+Math.random()*0.4}s ${Math.random()*2}s linear infinite;
    `;
    container.appendChild(drop);
  }
  return () => {};
}

// ---- PETALS: CSS flower petals floating ----
function createPetals(): () => void {
  const container = getContainer();
  const colors = ['hsl(330 70% 75%)', 'hsl(340 80% 80%)', 'hsl(350 60% 85%)', 'hsl(320 70% 70%)'];
  addStyle('theme-anim-style', `
    @keyframes petalFloat {
      0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
      10% { opacity: 0.7; }
      50% { transform: translateY(50vh) rotate(180deg) translateX(var(--sway)); }
      100% { transform: translateY(100vh) rotate(360deg) translateX(calc(var(--sway)*-1)); opacity: 0; }
    }
  `);

  for (let i = 0; i < 18; i++) {
    const petal = document.createElement('div');
    const size = 8 + Math.random() * 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    petal.style.cssText = `
      position:absolute;top:-20px;left:${Math.random()*100}%;
      width:${size}px;height:${size*1.4}px;
      background:${color};
      border-radius:50% 0 50% 0;
      --sway:${(Math.random()-0.5)*80}px;
      animation:petalFloat ${6+Math.random()*6}s ${Math.random()*4}s ease-in-out infinite;
      opacity:0.6;
    `;
    container.appendChild(petal);
  }
  return () => {};
}

// ---- HEARTS: floating heart shapes ----
function createHearts(): () => void {
  const container = getContainer();
  addStyle('theme-anim-style', `
    @keyframes heartRise {
      0% { transform: translateY(100vh) scale(0.5) rotate(0deg); opacity: 0; }
      10% { opacity: 0.7; }
      100% { transform: translateY(-20px) scale(1) rotate(var(--rot)); opacity: 0; }
    }
    .theme-heart::before, .theme-heart::after {
      content:''; position:absolute; width:100%; height:100%;
      background:inherit; border-radius:50% 50% 0 0;
    }
    .theme-heart::before { left:-25%; transform:rotate(-45deg); transform-origin:100% 100%; }
    .theme-heart::after { left:25%; transform:rotate(45deg); transform-origin:0 100%; }
  `);

  for (let i = 0; i < 12; i++) {
    const heart = document.createElement('div');
    const size = 8 + Math.random() * 12;
    const hue = 340 + Math.random() * 30;
    heart.className = 'theme-heart';
    heart.style.cssText = `
      position:absolute;bottom:-20px;left:${Math.random()*100}%;
      width:${size}px;height:${size}px;
      background:hsl(${hue} 80% 60%);
      transform:rotate(45deg);
      --rot:${(Math.random()-0.5)*40}deg;
      animation:heartRise ${8+Math.random()*6}s ${Math.random()*5}s ease-out infinite;
    `;
    container.appendChild(heart);
  }
  return () => {};
}

// ---- SPARKLE: golden twinkling dots ----
function createSparkle(config: ThemeConfig): () => void {
  const container = getContainer();
  addStyle('theme-anim-style', `
    @keyframes sparklePulse {
      0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
      50% { transform: scale(1) rotate(180deg); opacity: 1; }
    }
  `);

  const interval = setInterval(() => {
    if (container.children.length > 30) {
      container.removeChild(container.children[0]);
    }
    const spark = document.createElement('div');
    const size = 4 + Math.random() * 8;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    spark.style.cssText = `
      position:absolute;left:${x}%;top:${y}%;
      width:${size}px;height:${size}px;
      background:radial-gradient(circle, hsl(${config.primaryHsl} / 0.9), transparent);
      border-radius:50%;
      box-shadow: 0 0 ${size*2}px hsl(${config.accentHsl} / 0.5);
      animation:sparklePulse ${1+Math.random()*2}s ease-in-out forwards;
    `;
    container.appendChild(spark);
    setTimeout(() => spark.remove(), 3000);
  }, 300);

  return () => clearInterval(interval);
}

// ---- HOLI: color blasts from bottom ----
function createHoli(): () => void {
  const container = getContainer();
  const holiColors = [
    'hsl(0 80% 60%)',     // red
    'hsl(280 80% 60%)',   // purple
    'hsl(180 80% 50%)',   // teal
    'hsl(50 90% 55%)',    // yellow
    'hsl(120 70% 50%)',   // green
    'hsl(320 80% 60%)',   // pink
    'hsl(30 90% 55%)',    // orange
    'hsl(210 80% 60%)',   // blue
  ];

  addStyle('theme-anim-style', `
    @keyframes colorBurst {
      0% { transform: translateY(0) scale(0.3); opacity: 0.9; }
      40% { opacity: 0.6; }
      100% { transform: translateY(var(--rise)) scale(1.5); opacity: 0; }
    }
    @keyframes colorSplash {
      0% { transform: scale(0); opacity: 0.8; }
      100% { transform: scale(3); opacity: 0; }
    }
  `);

  // Continuous color puffs rising from bottom
  const interval = setInterval(() => {
    if (container.children.length > 25) {
      container.removeChild(container.children[0]);
    }

    const color = holiColors[Math.floor(Math.random() * holiColors.length)];
    const x = 10 + Math.random() * 80;
    const size = 20 + Math.random() * 40;
    const rise = -(200 + Math.random() * 400);

    const puff = document.createElement('div');
    puff.style.cssText = `
      position:absolute;bottom:0;left:${x}%;
      width:${size}px;height:${size}px;
      background:radial-gradient(circle, ${color}, transparent 70%);
      border-radius:50%;
      --rise:${rise}px;
      animation:colorBurst ${2+Math.random()*3}s ease-out forwards;
      filter:blur(${4+Math.random()*8}px);
    `;
    container.appendChild(puff);
    setTimeout(() => puff.remove(), 5000);
  }, 250);

  // Occasional splash bursts
  const splashInterval = setInterval(() => {
    const color = holiColors[Math.floor(Math.random() * holiColors.length)];
    const splash = document.createElement('div');
    const x = 10 + Math.random() * 80;
    const y = 30 + Math.random() * 50;
    splash.style.cssText = `
      position:absolute;left:${x}%;top:${y}%;
      width:30px;height:30px;
      background:radial-gradient(circle, ${color}, transparent 60%);
      border-radius:50%;
      animation:colorSplash 1.5s ease-out forwards;
      filter:blur(6px);
    `;
    container.appendChild(splash);
    setTimeout(() => splash.remove(), 1500);
  }, 800);

  return () => {
    clearInterval(interval);
    clearInterval(splashInterval);
  };
}

// ---- FIREWORKS: bursts from bottom ----
function createFireworks(config: ThemeConfig): () => void {
  const container = getContainer();
  const fwColors = [
    `hsl(${config.primaryHsl})`,
    `hsl(${config.accentHsl})`,
    'hsl(50 90% 60%)',
    'hsl(0 80% 60%)',
    'hsl(200 80% 60%)',
  ];

  addStyle('theme-anim-style', `
    @keyframes fwRise {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(var(--rise)); opacity: 0.5; }
    }
    @keyframes fwBurst {
      0% { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
    }
  `);

  const interval = setInterval(() => {
    const x = 10 + Math.random() * 80;
    const rise = -(200 + Math.random() * 300);

    // Create trail
    const trail = document.createElement('div');
    trail.style.cssText = `
      position:absolute;bottom:0;left:${x}%;
      width:3px;height:3px;
      background:hsl(50 90% 70%);
      border-radius:50%;
      --rise:${rise}px;
      animation:fwRise 0.8s ease-out forwards;
      box-shadow: 0 0 4px hsl(50 90% 70%);
    `;
    container.appendChild(trail);

    // Burst after rise
    setTimeout(() => {
      trail.remove();
      const color = fwColors[Math.floor(Math.random() * fwColors.length)];
      const particleCount = 12 + Math.floor(Math.random() * 8);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        const distance = 40 + Math.random() * 60;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        const p = document.createElement('div');
        const s = 2 + Math.random() * 3;
        p.style.cssText = `
          position:absolute;left:${x}%;top:calc(100% + ${rise}px);
          width:${s}px;height:${s}px;
          background:${color};
          border-radius:50%;
          --dx:${dx}px;--dy:${dy}px;
          animation:fwBurst ${0.8+Math.random()*0.5}s ease-out forwards;
          box-shadow: 0 0 ${s*2}px ${color};
        `;
        container.appendChild(p);
        setTimeout(() => p.remove(), 1500);
      }
    }, 800);
  }, 2000);

  return () => clearInterval(interval);
}

// ---- KITES: floating kite shapes ----
function createKites(): () => void {
  const container = getContainer();
  const kiteColors = ['hsl(0 80% 55%)', 'hsl(200 80% 55%)', 'hsl(50 90% 55%)', 'hsl(120 70% 50%)', 'hsl(280 70% 55%)'];

  addStyle('theme-anim-style', `
    @keyframes kiteFly {
      0%, 100% { transform: translateY(0) rotate(var(--tilt)) translateX(0); }
      25% { transform: translateY(-30px) rotate(calc(var(--tilt) + 5deg)) translateX(20px); }
      50% { transform: translateY(-15px) rotate(calc(var(--tilt) - 3deg)) translateX(-15px); }
      75% { transform: translateY(-40px) rotate(calc(var(--tilt) + 8deg)) translateX(10px); }
    }
  `);

  for (let i = 0; i < 5; i++) {
    const color = kiteColors[i % kiteColors.length];
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 40;
    const size = 16 + Math.random() * 12;

    const kite = document.createElement('div');
    kite.style.cssText = `
      position:absolute;left:${x}%;top:${y}%;
      width:${size}px;height:${size*1.3}px;
      background:${color};
      clip-path: polygon(50% 0%, 100% 40%, 50% 100%, 0% 40%);
      --tilt:${(Math.random()-0.5)*20}deg;
      animation:kiteFly ${4+Math.random()*4}s ${Math.random()*2}s ease-in-out infinite;
      opacity:0.7;
    `;

    // Kite tail
    const tail = document.createElement('div');
    tail.style.cssText = `
      position:absolute;left:50%;bottom:-${size*0.8}px;
      width:1px;height:${size*0.8}px;
      background:${color};transform:translateX(-50%);
      border-bottom-left-radius:50%;border-bottom-right-radius:50%;
    `;
    kite.appendChild(tail);
    container.appendChild(kite);
  }
  return () => {};
}

// ---- SUNSHINE: warm glow + light rays ----
function createSunshine(): () => void {
  const container = getContainer();
  addStyle('theme-anim-style', `
    @keyframes sunPulse {
      0%, 100% { opacity: 0.15; transform: scale(1); }
      50% { opacity: 0.25; transform: scale(1.05); }
    }
    @keyframes sunRay {
      0%, 100% { opacity: 0.1; }
      50% { opacity: 0.2; }
    }
  `);

  // Warm sun glow in top-right
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:absolute;top:-100px;right:-100px;
    width:400px;height:400px;
    background:radial-gradient(circle, hsl(40 90% 60% / 0.3), hsl(35 95% 55% / 0.1), transparent 70%);
    border-radius:50%;
    animation:sunPulse 6s ease-in-out infinite;
  `;
  container.appendChild(glow);

  // Light rays
  for (let i = 0; i < 6; i++) {
    const ray = document.createElement('div');
    const angle = -30 + i * 15;
    ray.style.cssText = `
      position:absolute;top:0;right:100px;
      width:2px;height:300px;
      background:linear-gradient(hsl(40 90% 60% / 0.15), transparent);
      transform-origin:top right;
      transform:rotate(${angle}deg);
      animation:sunRay ${3+Math.random()*2}s ${Math.random()*2}s ease-in-out infinite;
    `;
    container.appendChild(ray);
  }
  return () => {};
}
