import { useMemo, useRef, useState } from 'react';
import { EmptyHistory } from '@/components/history/EmptyHistory';
import { HistoryCard } from '@/components/history/HistoryCard';
import { SearchBar } from '@/components/history/SearchBar';
import { useHistory } from '@/hooks/useHistory';

export default function HistoryPage() {
  const { entries, loading, toggleFavorite, removeEntry, searchEntries } = useHistory();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleEntries = useMemo(() => {
    return searchEntries(query, 'all', 'newest');
  }, [searchEntries, query]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/60 bg-card/50 p-8 text-sm text-muted-foreground animate-pulse">Loading history…</div>
      ) : visibleEntries.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleEntries.map(entry => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onToggleExpanded={() => setExpandedId(current => current === entry.id ? null : entry.id)}
              onToggleFavorite={() => toggleFavorite(entry.id)}
              onDelete={() => removeEntry(entry.id)}
              onCopyPrompt={() => navigator.clipboard.writeText(entry.prompt)}
              onCopyResponse={() => navigator.clipboard.writeText(entry.response)}
              onDownload={() => {
                const blob = new Blob([entry.response], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `${entry.toolSlug}-${entry.id}.txt`;
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
