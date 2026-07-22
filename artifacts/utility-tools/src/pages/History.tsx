import { useMemo, useRef, useState } from 'react';
import { Download, Import, Trash2, History as HistoryIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyHistory } from '@/components/history/EmptyHistory';
import { HistoryCard } from '@/components/history/HistoryCard';
import { HistoryToolbar } from '@/components/history/HistoryToolbar';
import { SearchBar } from '@/components/history/SearchBar';
import { FilterBar } from '@/components/history/FilterBar';
import { useHistory } from '@/hooks/useHistory';
import type { HistorySort } from '@/types/history';

export default function HistoryPage() {
  const { entries, loading, toggleFavorite, removeEntry, clearAllHistory, importHistory, exportHistory, searchEntries } = useHistory();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<HistorySort>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories = useMemo(() => {
    return ['all', ...new Set(entries.map(entry => entry.toolCategory))];
  }, [entries]);

  const visibleEntries = useMemo(() => {
    return searchEntries(query, category, sort);
  }, [searchEntries, query, category, sort]);

  const onImportClick = () => fileInputRef.current?.click();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <HistoryIcon className="h-4 w-4" />
            AI History
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Your local AI generation history</h1>
          <p className="text-sm text-muted-foreground">Browse, search, favorite, and export your ToolboxX AI runs entirely on this device. History stays in your browser only and is never sent to the server.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-emerald-500/10 text-emerald-600">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Local only
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            {entries.length} saved
          </Badge>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          categories={categories}
        />
        <HistoryToolbar
          onImportClick={onImportClick}
          onExportJson={() => exportHistory('json', 'toolboxx-ai-history.json')}
          onExportTxt={() => exportHistory('txt', 'toolboxx-ai-history.txt')}
          onExportPdf={() => exportHistory('pdf', 'toolboxx-ai-history.pdf')}
          onClear={() => {
            if (window.confirm('Clear all local AI history? This cannot be undone.')) {
              clearAllHistory();
            }
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async event => {
            const file = event.target.files?.[0];
            if (!file) return;
            await importHistory(file);
            event.currentTarget.value = '';
          }}
        />
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
