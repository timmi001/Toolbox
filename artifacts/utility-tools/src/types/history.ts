import type { ToolCategory } from '@/lib/tools-data';

export type HistoryEntry = {
  id: string;
  toolSlug: string;
  toolName: string;
  toolCategory: ToolCategory;
  prompt: string;
  response: string;
  createdAt: string;
  characterCount: number;
  favorite: boolean;
};

export type HistorySort = 'newest' | 'oldest' | 'favorites';
export type HistoryExportFormat = 'json' | 'txt' | 'pdf';
