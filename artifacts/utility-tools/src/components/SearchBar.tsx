import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { searchTools, Tool, getToolRoutePath } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchTools(query).slice(0, 8));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

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

  return (
    <div className="relative w-full max-w-lg" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder="Search 100+ tools..."
          className="pl-9 bg-card border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50">
          <ul className="max-h-[60vh] overflow-y-auto p-1">
            {results.map((tool) => (
              <li key={tool.slug}>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center justify-between group transition-colors"
                  onClick={() => handleSelect(tool)}
                >
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tool.description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 bg-secondary text-secondary-foreground">
                    {tool.category}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
