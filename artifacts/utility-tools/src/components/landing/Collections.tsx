import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { toolsData } from '@/lib/tools-data';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ALL_COLLECTIONS = [
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
    emoji: '✍',
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
  'ai-grammar': '#4B0082',
  'ai-resume': '#4B0082',
  'ai-social': '#4B0082',
  'ai-blogging-seo': '#4B0082',
  'ai-email': '#4B0082',
  'ai-study-exams': '#4B0082',
  'ai-ghostwriting': '#4B0082',
  business: '#0EA5E9',
  marketing: '#D946EF',
};

const BATCH_SIZE = 8;

// Shuffle array deterministically by batch index
function getBatch(all: typeof toolsData, batchIndex: number) {
  // Use a stable shuffle based on batchIndex so the same set repeats predictably
  const shifted = [...all.slice(batchIndex * BATCH_SIZE), ...all.slice(0, batchIndex * BATCH_SIZE)];
  return shifted.slice(0, BATCH_SIZE);
}

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] ?? icons['Wrench'];
}

export function Collections() {
  const totalBatches = Math.ceil(toolsData.length / BATCH_SIZE);
  const [batchIndex, setBatchIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      // Fade out → swap batch → fade in
      setVisible(false);
      setTimeout(() => {
        setBatchIndex(prev => (prev + 1) % totalBatches);
        setVisible(true);
      }, 350);
    }, 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [totalBatches]);

  const spotlightTools = getBatch(toolsData, batchIndex);

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* ── Category chips ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">Browse</p>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tool Categories</h2>
        </motion.div>

        <div className="grid grid-cols-4 gap-2.5 lg:grid-cols-8">
          {ALL_COLLECTIONS.map((col, i) => {
            const count = toolsData.filter((t) => col.categories.includes(t.category)).length;
            return (
              <motion.div
                key={col.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.035 }}
                whileHover={{ y: -3 }}
              >
                <Link href={col.href}>
                  <div
                    className="group cursor-pointer overflow-hidden rounded-xl p-2.5 text-center transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]"
                    style={{ background: col.gradient }}
                  >
                    <div className="mb-1 text-2xl transition-transform duration-200 group-hover:scale-110 leading-none">
                      {col.emoji}
                    </div>
                    <p className="text-[11px] font-bold leading-tight text-gray-900 dark:text-gray-800">
                      {col.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium" style={{ color: col.accent }}>
                      {count} tools
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ── Rotating tools spotlight ── */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#4B0082]">All Tools</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Explore Tools
                <span className="ml-2 text-xs font-normal text-gray-400">refreshes every 60s</span>
              </h2>
            </div>
            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalBatches, 10) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setVisible(false); setTimeout(() => { setBatchIndex(i); setVisible(true); }, 350); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === batchIndex % Math.min(totalBatches, 10) ? 'w-4 bg-[#4B0082]' : 'w-1.5 bg-gray-200 hover:bg-gray-300'}`}
                  aria-label={`Batch ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {visible && (
              <motion.div
                key={batchIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8"
              >
                {spotlightTools.map((tool) => {
                  const Icon = getIcon(tool.icon ?? 'Wrench');
                  const accent = CATEGORY_ACCENT[tool.category] ?? '#4B0082';
                  const href = `/tools/${tool.slug}`;
                  return (
                    <Link key={tool.slug} href={href}>
                      <div className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-3 text-center transition-all duration-200 hover:border-transparent hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)] dark:bg-card dark:border-border/50">
                        <div
                          className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                          style={{ background: `${accent}15` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: accent }} />
                        </div>
                        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-gray-800 dark:text-gray-200">
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
