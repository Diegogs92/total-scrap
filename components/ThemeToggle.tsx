'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggle}
      className="btn bg-white/10 text-white hover:bg-white/20"
      aria-label="Cambiar tema"
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {isLight ? 'Modo oscuro' : 'Modo claro'}
    </button>
  );
}
