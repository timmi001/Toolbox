import { useEffect } from 'react';
import { Contrast, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const selectedTheme = resolvedTheme === 'bw' ? 'bw' : 'dark';

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', selectedTheme === 'bw' ? '#000000' : '#4B0082');
  }, [selectedTheme]);

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-foreground/40 hover:text-foreground">
      {selectedTheme === 'bw'
        ? <Contrast className="h-4 w-4 shrink-0" aria-hidden="true" />
        : <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <span className="sr-only">Theme:</span>
      <select
        value={selectedTheme}
        onChange={(event) => setTheme(event.target.value)}
        aria-label="Choose theme"
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-medium text-foreground outline-none"
      >
        <option value="dark">Dark</option>
        <option value="bw">Black &amp; White</option>
      </select>
    </label>
  );
}
