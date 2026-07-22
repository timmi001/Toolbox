import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { HistoryEntry, HistorySort } from '@/types/history';
import {
  clearHistory,
  deleteHistoryEntry,
  exportHistoryAsBlob,
  importHistoryFromText,
  loadHistory,
  saveHistoryEntry,
  updateHistoryEntry,
} from '@/utils/historyStorage';

export function useHistory() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setEntries(loadHistory());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id'> & { id?: string }) => {
    setEntries(prev => {
      const next = saveHistoryEntry(entry);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEntries(prev => {
      const item = prev.find(entry => entry.id === id);
      const next = updateHistoryEntry(id, { favorite: !item?.favorite });
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(deleteHistoryEntry(id));
  }, []);

  const clearAllHistory = useCallback(() => {
    setEntries(clearHistory());
    toast({ description: 'All local history has been cleared.' });
  }, [toast]);

  const importHistory = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const next = importHistoryFromText(text);
      setEntries(next);
      toast({ description: `Imported ${next.length} history items.` });
    } catch {
      toast({ description: 'Import failed. Please choose a valid ToolboxX export file.' });
    }
  }, [toast]);

  const exportHistory = useCallback(async (format: 'json' | 'txt' | 'pdf', filename: string) => {
    const blob = await exportHistoryAsBlob(entries, format);
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    toast({ description: `Exported ${entries.length} history item${entries.length === 1 ? '' : 's'} as ${format.toUpperCase()}.` });
  }, [entries, toast]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aFavorite = a.favorite ? 1 : 0;
      const bFavorite = b.favorite ? 1 : 0;

      if (aFavorite !== bFavorite) {
        return bFavorite - aFavorite;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [entries]);

  const searchEntries = useCallback((query: string, category: string, sort: HistorySort) => {
    const normalized = query.trim().toLowerCase();
    const filtered = sortedEntries.filter(entry => {
      const matchesQuery = !normalized || [entry.prompt, entry.response, entry.toolName].some(value => value.toLowerCase().includes(normalized));
      const matchesCategory = category === 'all' || entry.toolCategory === category;
      return matchesQuery && matchesCategory;
    });

    if (sort === 'oldest') {
      return [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    if (sort === 'favorites') {
      return [...filtered].sort((a, b) => Number(b.favorite) - Number(a.favorite) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sortedEntries]);

  return {
    entries,
    loading,
    refresh,
    addEntry,
    toggleFavorite,
    removeEntry,
    clearAllHistory,
    importHistory,
    exportHistory,
    searchEntries,
  };
}
