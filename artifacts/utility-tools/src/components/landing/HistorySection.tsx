import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { loadHistory, deleteHistoryEntry } from '@/utils/historyStorage';
import type { HistoryEntry } from '@/types/history';

const CATEGORY_EMOJI: Record<string, string> = {
  'ai grammar':      '✍️',
  'ai resume':       '📄',
  'ai social':       '📱',
  'ai email':        '✉️',
  'ai blogging':     '📝',
  'ai seo':          '📝',
  'ai study':        '📚',
  'ai exam':         '📚',
  'ai ghostwriting': '👻',
  'ai marketing':    '📣',
  'ai advertis':     '📣',
  'business':        '💼',
  'developer':       '💻',
  'text':            '📋',
  'image':           '🖼️',
  'pdf':             '📄',
  'calculator':      '🧮',
  'audio':           '🎵',
  'video':           '🎥',
  'file':            '📁',
};

function getCategoryEmoji(category: string): string {
  const lower = category.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return '🤖';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function KebabMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v); }}
        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Options"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-20 w-40 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          <Link href="/history">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            >
              <ExternalLink className="h-3 w-3 text-gray-400" />
              View in History
            </button>
          </Link>
          <div className="h-px bg-border" />
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export function HistorySection() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setItems(loadHistory().slice(0, 3));
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setItems(loadHistory().slice(0, 3));
  };

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">Recent</p>
              <h2 className="text-lg font-bold text-foreground">Continue Working</h2>
            </div>
            <Link href="/history" className="text-sm font-medium text-[#4B0082] transition-opacity hover:opacity-70">
              View all →
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-5">
              <Clock className="h-4 w-4 shrink-0 text-gray-300" />
              <p className="text-sm text-gray-400">Tools you use will appear here so you can pick up where you left off.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {items.map((item, i) => {
                const emoji = getCategoryEmoji(item.toolCategory);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    whileHover={{ y: -3 }}
                  >
                    <Link href="/history">
                      <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-[0_6px_24px_rgba(124,58,237,0.18)]">
                        <div
                          className="pointer-events-none absolute right-3 top-2 select-none text-6xl"
                          style={{ opacity: 0.055 }}
                          aria-hidden="true"
                        >
                          {emoji}
                        </div>
                        <div className="relative">
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4B0082]/8 text-lg">
                              {emoji}
                            </div>
                            <KebabMenu onDelete={() => handleDelete(item.id)} />
                          </div>
                          <p className="mb-1 text-sm font-semibold text-foreground">{item.toolName}</p>
                          <span className="mb-2 inline-block rounded-full bg-[#4B0082]/8 px-2 py-0.5 text-[11px] font-medium text-[#4B0082]">
                            AI Tools
                          </span>
                          <p className="mb-3 line-clamp-1 text-xs text-gray-500">{item.prompt}</p>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {timeAgo(item.createdAt)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-[#4B0082] opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
