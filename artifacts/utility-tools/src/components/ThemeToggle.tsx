import { useEffect } from 'react';
import { Moon, Square, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const selectedTheme = resolvedTheme === 'white' || resolvedTheme === 'black'
    ? resolvedTheme
    : 'dark';

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        selectedTheme === 'white' ? '#ffffff' : selectedTheme === 'black' ? '#000000' : '#4B0082',
      );
  }, [selectedTheme]);

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-foreground/40 hover:text-foreground">
      {selectedTheme === 'white'
        ? <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
        : selectedTheme === 'black'
          ? <Square className="h-4 w-4 shrink-0 fill-current" aria-hidden="true" />
          : <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <span className="sr-only">Theme:</span>
      <select
        value={selectedTheme}
        onChange={(event) => setTheme(event.target.value)}
        aria-label="Choose theme"
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-medium text-foreground outline-none"
      >
        <option value="dark">🌙 Dark</option>
        <option value="white">☀️ White</option>
        <option value="black">⬛ Black</option>
      </select>
    </label>
  );
}
