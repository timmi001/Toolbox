import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Search } from 'lucide-react';
import { searchTools, Tool, getToolRoutePath, toolsData } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const FEATURED_STARTERS = [...toolsData]
  .filter((tool) => tool.popular || tool.trending || tool.new)
  .slice(0, 6);

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>(FEATURED_STARTERS);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [, setLocation] = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return FEATURED_STARTERS;
    }
    return searchTools(trimmed).slice(0, 8);
  }, [query]);

  useEffect(() => {
    setResults(suggestions);
    setActiveIndex(0);
  }, [suggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tool: Tool) => {
    setQuery('');
    setIsOpen(false);
    setLocation(getToolRoutePath(tool));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        handleSelect(selected);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search 100+ tools..."
          className="h-12 rounded-2xl border-border/60 bg-background/80 pl-9 text-base shadow-sm focus-visible:ring-primary"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-2xl">
          <div className="border-b border-border/60 bg-muted/50 px-3 py-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {query.trim() ? 'Matching tools' : 'Popular starting points'}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto p-2">
            {results.map((tool, index) => (
              <li key={tool.slug}>
                <button
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${index === activeIndex ? 'bg-primary/10 text-foreground' : 'hover:bg-muted'}`}
                  onClick={() => handleSelect(tool)}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{tool.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-secondary/70 text-secondary-foreground">
                      {tool.category}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
