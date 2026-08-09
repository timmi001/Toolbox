import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { toolsData } from '@/lib/tools-data';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const UTILITY_COLLECTIONS = [
  {
    emoji: '📄',
    name: 'PDF Tools',
    href: '/pdf-tools',
    categories: ['pdf'],
    gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
    accent: '#EF4444',
  },
  {
    emoji: '🖼',
    name: 'Image Tools',
    href: '/image-tools',
    categories: ['image'],
    gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)',
    accent: '#F59E0B',
  },
  {
    emoji: '🎥',
    name: 'Video Tools',
    href: '/video-tools',
    categories: ['video'],
    gradient: 'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)',
    accent: '#7C3AED',
  },
  {
    emoji: '🎵',
    name: 'Audio Tools',
    href: '/audio-tools',
    categories: ['audio'],
    gradient: 'linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)',
    accent: '#EC4899',
  },
  {
    emoji: '💻',
    name: 'Developer Tools',
    href: '/developer-tools',
    categories: ['developer'],
    gradient: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)',
    accent: '#10B981',
  },
  {
    emoji: '✍️',
    name: 'Text Tools',
    href: '/text-tools',
    categories: ['text'],
    gradient: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)',
    accent: '#3B82F6',
  },
  {
    emoji: '🧮',
    name: 'Calculators',
    href: '/calculators',
    categories: ['calculators'],
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
    accent: '#F97316',
  },
  {
    emoji: '📁',
    name: 'File Conversion',
    href: '/file-conversion-tools',
    categories: ['file-conversion'],
    gradient: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
    accent: '#6B7280',
  },
];

const AI_COLLECTIONS = [
  {
    emoji: '✍️',
    name: 'Grammar & Writing',
    href: '/ai-grammar-tools',
    categories: ['ai-grammar'],
    gradient: 'linear-gradient(135deg, #F3E8FF 0%, #DDD6FE 100%)',
    accent: '#7C3AED',
  },
  {
    emoji: '📄',
    name: 'Resume Builder',
    href: '/ai-resume-tools',
    categories: ['ai-resume'],
    gradient: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)',
    accent: '#6D28D9',
  },
  {
    emoji: '📱',
    name: 'Social Media',
    href: '/ai-social-media-tools',
    categories: ['ai-social'],
    gradient: 'linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)',
    accent: '#EC4899',
  },
  {
    emoji: '📝',
    name: 'Blogging & SEO',
    href: '/ai-blogging-seo-tools',
    categories: ['ai-blogging-seo'],
    gradient: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)',
    accent: '#059669',
  },
  {
    emoji: '✉️',
    name: 'Email Tools',
    href: '/ai-email-tools',
    categories: ['ai-email'],
    gradient: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)',
    accent: '#3B82F6',
  },
  {
    emoji: '👻',
    name: 'Ghostwriting',
    href: '/ai-ghostwriting-tools',
    categories: ['ai-ghostwriting'],
    gradient: 'linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)',
    accent: '#475569',
  },
  {
    emoji: '📣',
    name: 'Marketing',
    href: '/ai-marketing-advertising',
    categories: ['marketing'],
    gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
    accent: '#DC2626',
  },
];

// Map category → accent color for the spotlight cards
const CATEGORY_ACCENT: Record<string, string> = {
  text: '#3B82F6',
  developer: '#10B981',
  image: '#F59E0B',
  pdf: '#EF4444',
  calculators: '#F97316',
  'file-conversion': '#6B7280',
  audio: '#EC4899',
  video: '#7C3AED',
  ai: '#4B0082',
  'ai-grammar': '#7C3AED',
  'ai-resume': '#6D28D9',
  'ai-social': '#EC4899',
  'ai-blogging-seo': '#059669',
  'ai-email': '#3B82F6',
  'ai-ghostwriting': '#475569',
  business: '#0EA5E9',
  marketing: '#DC2626',
};

// How many tools to fetch per batch — always 8 (the desktop maximum).
// On mobile we visually hide the last 2 via CSS, showing 6 in a 2×3 grid.
const BATCH_SIZE = 8;
// Rotation interval in ms. New tools added to toolsData are picked up automatically.
const ROTATION_INTERVAL_MS = 7_000;

function getBatch(all: typeof toolsData, batchIndex: number) {
  const shifted = [...all.slice(batchIndex * BATCH_SIZE), ...all.slice(0, batchIndex * BATCH_SIZE)];
  return shifted.slice(0, BATCH_SIZE);
}

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] ?? icons['Wrench'];
}

export function Collections() {
  // Mode is controlled exclusively by the manual Utility / AI toggle buttons.
  const [mode, setMode] = useState<'utility' | 'ai'>('utility');
  const [chipsVisible, setChipsVisible] = useState(true);

  const collections = mode === 'utility' ? UTILITY_COLLECTIONS : AI_COLLECTIONS;
  const modeLabel   = mode === 'utility' ? 'Utility Tools' : 'AI Tools';
  const modeHref    = mode === 'utility' ? '/utility-tools' : '/ai-tools';

  // Spotlight (all tools, rotates every 60 s)
  const totalBatches = Math.ceil(toolsData.length / BATCH_SIZE);
  const [batchIndex, setBatchIndex] = useState(0);
  const [spotVisible, setSpotVisible] = useState(true);
  const spotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    spotTimerRef.current = setInterval(() => {
      setSpotVisible(false);
      setTimeout(() => {
        setBatchIndex(prev => (prev + 1) % totalBatches);
        setSpotVisible(true);
      }, 350);
    }, ROTATION_INTERVAL_MS);
    return () => { if (spotTimerRef.current) clearInterval(spotTimerRef.current); };
  }, [totalBatches]);

  const spotlightTools = getBatch(toolsData, batchIndex);

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
                        className="group cursor-pointer overflow-hidden rounded-xl p-2.5 text-center transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]"
                        style={{ background: col.gradient }}
                      >
                        <div className="mb-1 text-2xl leading-none transition-transform duration-200 group-hover:scale-110">
                          {col.emoji}
                        </div>
                        <p className="text-[11px] font-bold leading-tight text-foreground">
                          {col.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium" style={{ color: col.accent }}>
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

        {/* ── Rotating tools spotlight ── */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">All Tools</p>
              <h2 className="text-lg font-bold text-foreground">Explore Tools</h2>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalBatches, 10) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setSpotVisible(false); setTimeout(() => { setBatchIndex(i); setSpotVisible(true); }, 350); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === batchIndex % Math.min(totalBatches, 10)
                      ? 'w-4 bg-[#4B0082]'
                      : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                  aria-label={`Batch ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Progress bar — resets every rotation via key change */}
          <div className="mb-3 h-0.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              key={`prog-${batchIndex}`}
              className="h-full w-full origin-left rounded-full bg-[#4B0082]"
              style={{ animation: `toolsRotationProgress ${ROTATION_INTERVAL_MS}ms linear forwards` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {spotVisible && (
              <motion.div
                key={batchIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8"
              >
                {spotlightTools.map((tool, idx) => {
                  const Icon = getIcon(tool.icon ?? 'Wrench');
                  const accent = CATEGORY_ACCENT[tool.category] ?? '#4B0082';
                  // Cards 7–8 (index 6–7): visible on sm+ (≥640 px), hidden on mobile.
                  // This gives 6 cards in a 2×3 grid on mobile and 8 on tablet/desktop.
                  const responsiveClass = idx >= 6 ? 'hidden sm:block' : '';
                  return (
                    <Link key={tool.slug} href={`/tools/${tool.slug}`} className={responsiveClass}>
                      <div className="group cursor-pointer rounded-xl border border-border/50 bg-card p-3 text-center transition-all duration-200 hover:border-transparent hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
                        <div
                          className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                          style={{ background: `${accent}15` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: accent }} />
                        </div>
                        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground">
                          {tool.name}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
