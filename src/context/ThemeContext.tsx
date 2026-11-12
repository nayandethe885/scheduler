'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';
export type FontStyle = 'editorial' | 'minimal' | 'mono' | 'space';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  fontStyle: FontStyle;
  setFontStyle: (font: FontStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  initialTheme 
}: { 
  children: React.ReactNode; 
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [fontStyle, setFontStyleState] = useState<FontStyle>('editorial');

  const applyTheme = useCallback((t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const applyFont = useCallback((f: FontStyle) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-font', f);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lifeos_theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
        applyTheme(stored);
      } else if (initialTheme) {
        setThemeState(initialTheme);
        applyTheme(initialTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme: Theme = prefersDark ? 'dark' : 'light';
        setThemeState(defaultTheme);
        applyTheme(defaultTheme);
      }

      const storedFont = localStorage.getItem('lifeos_font') as FontStyle | null;
      if (storedFont) {
        setFontStyleState(storedFont);
        applyFont(storedFont);
      } else {
        applyFont('editorial');
      }
    } catch {
      applyTheme('dark');
      applyFont('editorial');
    }
  }, [initialTheme, applyTheme, applyFont]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('lifeos_theme', newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  const setFontStyle = (newFont: FontStyle) => {
    setFontStyleState(newFont);
    try {
      localStorage.setItem('lifeos_font', newFont);
    } catch {}
    applyFont(newFont);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, fontStyle, setFontStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

