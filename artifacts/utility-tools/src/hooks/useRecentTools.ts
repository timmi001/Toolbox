import { useState, useEffect } from 'react';
import { Tool, getToolBySlug } from '@/lib/tools-data';

const MAX_RECENT = 6;
const STORAGE_KEY = 'recent_tools';

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<Tool[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const slugs: string[] = JSON.parse(stored);
        const tools = slugs.map(getToolBySlug).filter((t): t is Tool => t !== undefined);
        setRecentTools(tools);
      }
    } catch (e) {
      console.error('Failed to load recent tools', e);
    }
  }, []);

  const addRecentTool = (slug: string) => {
    setRecentTools(prev => {
      const filtered = prev.filter(t => t.slug !== slug);
      const tool = getToolBySlug(slug);
      if (!tool) return prev;
      
      const updated = [tool, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.map(t => t.slug)));
      return updated;
    });
  };

  return { recentTools, addRecentTool };
}
