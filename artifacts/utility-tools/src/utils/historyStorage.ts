import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { HistoryEntry, HistoryExportFormat } from '@/types/history';

const MAX_HISTORY_ITEMS = 200;

function getStorageKey() {
  const origin = typeof window !== 'undefined' && typeof window.location?.origin === 'string'
    ? window.location.origin
    : 'toolboxx-local';

  return `toolboxx-ai-history:${origin}`;
}

function isValidHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.toolSlug === 'string' &&
    typeof item.toolName === 'string' &&
    typeof item.toolCategory === 'string' &&
    typeof item.prompt === 'string' &&
    typeof item.response === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.characterCount === 'number' &&
    typeof item.favorite === 'boolean'
  );
}

function safeStorageGet(): HistoryEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey());
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidHistoryEntry).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

function safeStorageSet(entries: HistoryEntry[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(getStorageKey(), JSON.stringify(entries));
  } catch {
    // Gracefully ignore Local Storage quota issues.
  }
}

export function loadHistory(): HistoryEntry[] {
  return safeStorageGet();
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, 'id'> & { id?: string }): HistoryEntry[] {
  const id = entry.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const normalizedEntry: HistoryEntry = {
    ...entry,
    id,
    characterCount: typeof entry.characterCount === 'number' ? entry.characterCount : entry.response.length,
  };

  const current = safeStorageGet();
  const next = [normalizedEntry, ...current.filter(item => item.id !== normalizedEntry.id)].slice(0, MAX_HISTORY_ITEMS);
  safeStorageSet(next);
  return next;
}

export function updateHistoryEntry(id: string, updates: Partial<HistoryEntry>): HistoryEntry[] {
  const current = safeStorageGet();
  const next = current.map(item => (item.id === id ? { ...item, ...updates } : item));
  safeStorageSet(next);
  return next;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const current = safeStorageGet();
  const next = current.filter(item => item.id !== id);
  safeStorageSet(next);
  return next;
}

export function clearHistory(): HistoryEntry[] {
  safeStorageSet([]);
  return [];
}

export function importHistoryFromText(rawText: string): HistoryEntry[] {
  const parsed = JSON.parse(rawText) as unknown;
  if (!Array.isArray(parsed)) return loadHistory();

  const next = parsed.filter(isValidHistoryEntry).map(entry => ({
    ...entry,
    id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  }));

  const merged = [...next, ...loadHistory()].slice(0, MAX_HISTORY_ITEMS);
  safeStorageSet(merged);
  return merged;
}

export async function exportHistoryAsBlob(entries: HistoryEntry[], format: HistoryExportFormat): Promise<Blob> {
  if (format === 'json') {
    return new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  }

  if (format === 'txt') {
    const text = entries
      .map(item => {
        const date = new Date(item.createdAt).toLocaleString();
        return [
          `Tool: ${item.toolName}`,
          `Category: ${item.toolCategory}`,
          `Date: ${date}`,
          `Favorite: ${item.favorite ? 'Yes' : 'No'}`,
          `Prompt: ${item.prompt}`,
          `Response: ${item.response}`,
          '---',
        ].join('\n');
      })
      .join('\n\n');

    return new Blob([text], { type: 'text/plain;charset=utf-8' });
  }

  return exportHistoryAsPdf(entries);
}

async function exportHistoryAsPdf(entries: HistoryEntry[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595.28, 841.89]);
  let y = page.getHeight() - 40;
  const margin = 40;

  page.drawText('ToolboxX AI History', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.12, 0.15, 0.2),
  });
  y -= 28;

  for (const entry of entries) {
    if (y < 120) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = page.getHeight() - 40;
    }

    const lines = [
      `Tool: ${entry.toolName}`,
      `Category: ${entry.toolCategory}`,
      `Date: ${new Date(entry.createdAt).toLocaleString()}`,
      `Prompt: ${entry.prompt}`,
      `Response: ${entry.response}`,
    ];

    page.drawText(lines[0], { x: margin, y, size: 11, font: boldFont, color: rgb(0.15, 0.15, 0.15) });
    y -= 16;

    for (let i = 1; i < lines.length; i += 1) {
      const wrapped = font.widthOfTextAtSize(lines[i], 10);
      const safe = wrapped > 500 ? lines[i].slice(0, 180) : lines[i];
      page.drawText(safe, { x: margin, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 14;
      if (y < 60) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = page.getHeight() - 40;
      }
    }

    y -= 10;
  }

  const bytes = await pdfDoc.save();
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

export const HISTORY_LIMIT = MAX_HISTORY_ITEMS;
