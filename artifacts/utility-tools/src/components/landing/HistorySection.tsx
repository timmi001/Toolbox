import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { loadHistory } from '@/utils/historyStorage';
import type { HistoryEntry } from '@/types/history';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function HistorySection() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const recent = loadHistory().slice(0, 3);
    setItems(recent);
  }, []);

  if (items.length === 0) return null;

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
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">Recent</p>
              <h2 className="text-2xl font-bold text-[#111827] dark:text-white">Continue Working</h2>
            </div>
            <Link
              href="/history"
              className="text-sm font-medium text-[#7C3AED] transition-opacity hover:opacity-70"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Link href="/history">
                  <div className="group cursor-pointer rounded-[20px] border border-border/60 bg-white p-5 transition-all hover:border-[#7C3AED]/30 hover:shadow-[0_8px_32px_rgba(124,58,237,0.10)] dark:bg-card">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                      <Clock className="h-4 w-4 text-[#7C3AED]" />
                    </div>
                    <p className="mb-1 font-semibold text-[#111827] dark:text-white">{item.toolName}</p>
                    <p className="mb-3 line-clamp-1 text-xs text-[#6B7280] dark:text-muted-foreground">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6B7280]">{timeAgo(item.createdAt)}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#7C3AED] opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
