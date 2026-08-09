import { useEffect } from 'react';
import { Moon } from 'lucide-react';

export function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    try {
      localStorage.setItem('theme', 'dark');
    } catch {}
  }, []);

  return (
    <button
      onClick={() => document.documentElement.classList.add('dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      aria-label="Dark theme enabled"
    >
      <Moon className="h-4 w-4" />
    </button>
  );
}
