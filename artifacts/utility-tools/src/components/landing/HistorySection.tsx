import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { loadHistory, deleteHistoryEntry } from '@/utils/historyStorage';
import type { HistoryEntry } from '@/types/history';

// Map tool categories to emoji for the large faded bg icon
const CATEGORY_EMOJI: Record<string, string> = {
  'ai grammar':        '✍️',
  'ai resume':         '📄',
  'ai social':         '📱',
  'ai email':          '✉️',
  'ai blogging':       '📝',
  'ai seo':            '📝',
  'ai study':          '📚',
  'ai exam':           '📚',
  'ai ghostwriting':   '👻',
  'ai marketing':      '📣',
  'ai advertis':       '📣',
  'business':          '💼',
  'developer':         '💻',
  'text':              '📋',
  'image':             '🖼️',
  'pdf':               '📄',
  'calculator':        '🧮',
  'audio':             '🎵',
  'video':             '🎥',
  'file':              '📁',
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
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
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
        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <Link href="/history">
            <button
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
              View in History
            </button>
          </Link>
          <div className="h-px bg-gray-100" />
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
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

  if (items.length === 0) return null;

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setItems(loadHistory().slice(0, 3));
  };

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">Recent</p>
              <h2 className="text-2xl font-bold text-gray-900">Continue Working</h2>
            </div>
            <Link href="/history" className="text-sm font-medium text-[#4B0082] transition-opacity hover:opacity-70">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {items.map((item, i) => {
              const emoji = getCategoryEmoji(item.toolCategory);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href="/history">
                    <div className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-[#4B0082]/20 hover:shadow-[0_8px_32px_rgba(75,0,130,0.10)]">
                      {/* Large faded background icon */}
                      <div
                        className="pointer-events-none absolute right-4 top-3 select-none text-8xl"
                        style={{ opacity: 0.055 }}
                        aria-hidden="true"
                      >
                        {emoji}
                      </div>

                      <div className="relative">
                        {/* Top row — small icon + kebab */}
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4B0082]/8 text-xl">
                            {emoji}
                          </div>
                          <KebabMenu onDelete={() => handleDelete(item.id)} />
                        </div>

                        {/* Tool name */}
                        <p className="mb-1 font-semibold text-gray-900">{item.toolName}</p>

                        {/* Category badge */}
                        <span className="mb-3 inline-block rounded-full bg-[#4B0082]/8 px-2.5 py-0.5 text-xs font-medium text-[#4B0082]">
                          AI Tools
                        </span>

                        {/* Prompt preview */}
                        <p className="mb-4 line-clamp-1 text-xs text-gray-500">{item.prompt}</p>

                        {/* Bottom row — timestamp + arrow */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {timeAgo(item.createdAt)}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#4B0082] opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
