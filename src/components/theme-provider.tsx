import { useEffect, useState, type FC, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme-context';

// Read by the inline script in index.html, which sets the first theme before React loads.
const STORAGE_KEY = 'portfolio-theme';

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark',
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (next: Theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage blocked: the choice lasts until the tab closes.
      }
      setTheme(next);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
