import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { toolsData } from '@/lib/tools-data';

const UTILITY_COLLECTIONS = [
  {
    emoji: '📄',
    name: 'PDF Tools',
    href: '/pdf-tools',
    categories: ['pdf'],
    gradient: 'linear-gradient(135deg, rgba(127, 29, 29, 0.72) 0%, rgba(69, 10, 10, 0.92) 100%)',
    accent: '#EF4444',
  },
  {
    emoji: '🖼',
    name: 'Image Tools',
    href: '/image-tools',
    categories: ['image'],
    gradient: 'linear-gradient(135deg, rgba(120, 83, 10, 0.72) 0%, rgba(66, 32, 6, 0.92) 100%)',
    accent: '#F59E0B',
  },
  {
    emoji: '🎥',
    name: 'Video Tools',
    href: '/video-tools',
    categories: ['video'],
    gradient: 'linear-gradient(135deg, rgba(76, 29, 149, 0.72) 0%, rgba(46, 16, 101, 0.92) 100%)',
    accent: '#7C3AED',
  },
  {
    emoji: '🎵',
    name: 'Audio Tools',
    href: '/audio-tools',
    categories: ['audio'],
    gradient: 'linear-gradient(135deg, rgba(131, 24, 67, 0.72) 0%, rgba(80, 7, 36, 0.92) 100%)',
    accent: '#EC4899',
  },
  {
    emoji: '💻',
    name: 'Developer Tools',
    href: '/developer-tools',
    categories: ['developer'],
    gradient: 'linear-gradient(135deg, rgba(6, 95, 70, 0.72) 0%, rgba(2, 44, 34, 0.92) 100%)',
    accent: '#10B981',
  },
  {
    emoji: '✍️',
    name: 'Text Tools',
    href: '/text-tools',
    categories: ['text'],
    gradient: 'linear-gradient(135deg, rgba(30, 64, 175, 0.72) 0%, rgba(15, 36, 88, 0.92) 100%)',
    accent: '#3B82F6',
  },
  {
    emoji: '🧮',
    name: 'Calculators',
    href: '/calculators',
    categories: ['calculators'],
    gradient: 'linear-gradient(135deg, rgba(154, 52, 18, 0.72) 0%, rgba(67, 20, 7, 0.92) 100%)',
    accent: '#F97316',
  },
  {
    emoji: '📁',
    name: 'File Conversion',
    href: '/file-conversion-tools',
    categories: ['file-conversion'],
    gradient: 'linear-gradient(135deg, rgba(75, 85, 99, 0.72) 0%, rgba(31, 35, 42, 0.92) 100%)',
    accent: '#6B7280',
  },
];

const AI_COLLECTIONS = [
  {
    emoji: '✍️',
    name: 'Grammar & Writing',
    href: '/ai-grammar-tools',
    categories: ['ai-grammar'],
    gradient: 'linear-gradient(135deg, rgba(107, 33, 168, 0.72) 0%, rgba(59, 18, 92, 0.92) 100%)',
    accent: '#7C3AED',
  },
  {
    emoji: '📄',
    name: 'Resume Builder',
    href: '/ai-resume-tools',
    categories: ['ai-resume'],
    gradient: 'linear-gradient(135deg, rgba(91, 33, 182, 0.72) 0%, rgba(49, 22, 105, 0.92) 100%)',
    accent: '#6D28D9',
  },
  {
    emoji: '📱',
    name: 'Social Media',
    href: '/ai-social-media-tools',
    categories: ['ai-social'],
    gradient: 'linear-gradient(135deg, rgba(131, 24, 67, 0.72) 0%, rgba(80, 7, 36, 0.92) 100%)',
    accent: '#EC4899',
  },
  {
    emoji: '📝',
    name: 'Blogging & SEO',
    href: '/ai-blogging-seo-tools',
    categories: ['ai-blogging-seo'],
    gradient: 'linear-gradient(135deg, rgba(6, 95, 70, 0.72) 0%, rgba(2, 44, 34, 0.92) 100%)',
    accent: '#059669',
  },
  {
    emoji: '✉️',
    name: 'Email Tools',
    href: '/ai-email-tools',
    categories: ['ai-email'],
    gradient: 'linear-gradient(135deg, rgba(30, 64, 175, 0.72) 0%, rgba(15, 36, 88, 0.92) 100%)',
    accent: '#3B82F6',
  },
  {
    emoji: '👻',
    name: 'Ghostwriting',
    href: '/ai-ghostwriting-tools',
    categories: ['ai-ghostwriting'],
    gradient: 'linear-gradient(135deg, rgba(71, 85, 105, 0.72) 0%, rgba(30, 41, 59, 0.92) 100%)',
    accent: '#475569',
  },
  {
    emoji: '📣',
    name: 'Marketing',
    href: '/ai-marketing-advertising',
    categories: ['marketing'],
    gradient: 'linear-gradient(135deg, rgba(127, 29, 29, 0.72) 0%, rgba(69, 10, 10, 0.92) 100%)',
    accent: '#DC2626',
  },
];

export function Collections() {
  // Mode is controlled exclusively by the manual Utility / AI toggle buttons.
  const [mode, setMode] = useState<'utility' | 'ai'>('utility');
  const [chipsVisible, setChipsVisible] = useState(true);

  const collections = mode === 'utility' ? UTILITY_COLLECTIONS : AI_COLLECTIONS;
  const modeLabel   = mode === 'utility' ? 'Utility Tools' : 'AI Tools';
  const modeHref    = mode === 'utility' ? '/utility-tools' : '/ai-tools';

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* ── Category chips header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-4 flex items-end justify-between"
        >
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">Browse</p>
            <h2 className="text-lg font-bold text-foreground">Tool Categories</h2>
          </div>
          {/* Mode toggle pills */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
            {(['utility', 'ai'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setChipsVisible(false); setTimeout(() => { setMode(m); setChipsVisible(true); }, 300); }}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-[#4B0082] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'utility' ? 'Utility' : 'AI'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Chips grid ── */}
        <AnimatePresence mode="wait">
          {chipsVisible && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-4 gap-2.5 lg:grid-cols-8"
            >
              {collections.map((col) => {
                const count = toolsData.filter(t => col.categories.includes(t.category)).length;
                return (
                  <motion.div
                    key={col.name}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Link href={col.href}>
                      <div
                        className="group cursor-pointer overflow-hidden rounded-xl border border-white/15 p-2.5 text-center text-white shadow-sm transition-all duration-200 hover:border-white/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                        style={{ background: col.gradient, boxShadow: `inset 0 1px 0 ${col.accent}45` }}
                      >
                        <div className="mb-1 text-2xl leading-none transition-transform duration-200 group-hover:scale-110">
                          {col.emoji}
                        </div>
                        <p className="text-[11px] font-bold leading-tight text-white drop-shadow-sm">
                          {col.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold" style={{ color: '#DDE7FF' }}>
                          {count > 0 ? `${count} tools` : 'Explore →'}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* "View all" link */}
        <div className="mt-2.5 text-right">
          <Link href={modeHref} className="text-xs font-medium text-[#4B0082] transition-opacity hover:opacity-70">
            View all {modeLabel} →
          </Link>
        </div>

      </div>
    </section>
  );
}
