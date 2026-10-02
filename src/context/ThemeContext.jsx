import { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { getPalette, DEFAULT_PALETTE_ID, PALETTES } from '../lib/palettes';

const ThemeContext = createContext();

function applyPalette(palette) {
  const root = document.documentElement;
  for (const [shade, hex] of Object.entries(palette.colors)) {
    root.style.setProperty(`--color-primary-${shade}`, hex);
  }
  root.style.setProperty('--brand-rgb', palette.rgb);
  root.style.setProperty('--brand-btn', palette.btn.join(', '));
  root.style.setProperty('--brand-btn-hover', palette.btnHover.join(', '));
  root.style.setProperty('--brand-edge', palette.edge);
  root.style.setProperty('--brand-hero', palette.hero.join(', '));
  root.style.setProperty('--brand-mesh1', palette.rgb);
  root.style.setProperty('--brand-mesh2', palette.accent1);
  root.style.setProperty('--brand-mesh3', palette.accent2);

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', palette.colors[600]);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('spendly-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [paletteId, setPaletteId] = useState(
    () => localStorage.getItem('spendly-palette') || DEFAULT_PALETTE_ID
  );

  const palette = getPalette(paletteId);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('spendly-theme', theme);
    if (Capacitor.isNativePlatform()) {
      SystemBars.setStyle({
        style: theme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
      }).catch(() => {});
    }
  }, [theme]);

  useEffect(() => {
    applyPalette(palette);
    localStorage.setItem('spendly-palette', paletteId);
  }, [paletteId, palette]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, palette, paletteId, setPaletteId, palettes: PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
