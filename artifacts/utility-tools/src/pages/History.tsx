import { useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { EmptyHistory } from '@/components/history/EmptyHistory';
import { HistoryCard } from '@/components/history/HistoryCard';
import { HistoryToolbar } from '@/components/history/HistoryToolbar';
import { SearchBar } from '@/components/history/SearchBar';
import { useHistory } from '@/hooks/useHistory';

export default function HistoryPage() {
  const { entries, loading, toggleFavorite, removeEntry, searchEntries, importHistory, exportHistory, clearAllHistory } = useHistory();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleEntries = useMemo(() => {
    return searchEntries(query, 'all', 'newest');
  }, [searchEntries, query]);

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 text-sm font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <div className="space-y-4">
        <SearchBar value={query} onChange={setQuery} />
        <HistoryToolbar
          onImportClick={() => fileInputRef.current?.click()}
          onExportJson={() => void exportHistory('json', 'toolbuxx-history.json')}
          onExportTxt={() => void exportHistory('txt', 'toolbuxx-history.txt')}
          onExportPdf={() => void exportHistory('pdf', 'toolbuxx-history.pdf')}
          onClear={() => { if (window.confirm('Clear all saved history?')) clearAllHistory(); }}
        />
        <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importHistory(file); event.target.value = ''; }} />
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
