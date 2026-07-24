import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, FileText, Image as ImageIcon,
  Type, Code, Video, Music, Calculator, Cpu,
} from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { getToolRoutePath, toolsData } from '@/lib/tools-data';

/* ── Floating background icons ─────────────────────────────────────── */
const FLOATING = [
  { Icon: FileText,   label: 'PDF',        color: '#FFE4E4', iconColor: '#FF6B6B', x: '6%',  y: '18%', delay: 0 },
  { Icon: ImageIcon,  label: 'Image',      color: '#E4F9F7', iconColor: '#4ECDC4', x: '87%', y: '14%', delay: 0.6 },
  { Icon: Type,       label: 'Text',       color: '#E4F4FF', iconColor: '#45B7D1', x: '3%',  y: '62%', delay: 1.1 },
  { Icon: Code,       label: 'Code',       color: '#E8F5E9', iconColor: '#66BB6A', x: '91%', y: '58%', delay: 0.4 },
  { Icon: Video,      label: 'Video',      color: '#FFF8E1', iconColor: '#FFCA28', x: '14%', y: '84%', delay: 0.9 },
  { Icon: Music,      label: 'Audio',      color: '#F3E5F5', iconColor: '#AB47BC', x: '82%', y: '80%', delay: 0.2 },
  { Icon: Calculator, label: 'Calculator', color: '#E8EAF6', iconColor: '#5C6BC0', x: '48%', y: '4%',  delay: 1.3 },
];

/* ── Categories ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  { emoji: '🖼', name: 'Image',      path: '/image-tools',              bg: '#FFF3E0' },
  { emoji: '📄', name: 'PDF',        path: '/pdf-tools',                bg: '#FCE4EC' },
  { emoji: '✍', name: 'Text',        path: '/text-tools',               bg: '#E3F2FD' },
  { emoji: '🎥', name: 'Video',      path: '/video-tools',              bg: '#F3E5F5' },
  { emoji: '🎵', name: 'Audio',      path: '/audio-tools',              bg: '#E8F5E9' },
  { emoji: '💻', name: 'Developer',  path: '/developer-tools',          bg: '#E0F7FA' },
  { emoji: '🧮', name: 'Calculator', path: '/calculators',              bg: '#FFF8E1' },
  { emoji: '🤖', name: 'AI Tools',   path: '/ai-grammar-tools',         bg: '#EDE7F6' },
];

/* ── Popular tools (up to 8) ────────────────────────────────────────── */
const POPULAR_TOOLS = [...toolsData]
  .filter((t) => t.popular || t.trending)
  .slice(0, 8);

/* ── Icon map for tool cards ────────────────────────────────────────── */
const TOOL_ICON_COLORS = [
  '#6C4EFF', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#AB47BC', '#66BB6A', '#FFCA28', '#5C6BC0',
];

/* ── Feature cards ──────────────────────────────────────────────────── */
const FEATURES = [
  { title: '100% Free',      desc: 'No hidden costs, ever.' },
  { title: 'Fast & Secure',  desc: 'All tools run in your browser.' },
  { title: 'Easy to Use',    desc: 'No learning curve required.' },
  { title: 'Always Updated', desc: 'New tools added regularly.' },
];

/* ── Animation helpers ──────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: d, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Home() {
  return (
    <div className="pb-20">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">

        {/* Soft purple glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6C4EFF]/[0.07] blur-[140px]" />
        </div>

        {/* Floating icons */}
        {FLOATING.map(({ Icon, label, color, iconColor, x, y, delay }) => (
          <motion.div
            key={label}
            className="pointer-events-none absolute hidden select-none md:block"
            style={{ left: x, top: y }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, -14, 0] }}
            transition={{
              opacity: { duration: 0.8, delay },
              y: { duration: 5 + delay * 0.4, repeat: Infinity, ease: 'easeInOut', delay },
            }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl opacity-30 backdrop-blur-sm"
              style={{ backgroundColor: color }}
            >
              <Icon className="h-6 w-6" style={{ color: iconColor }} />
            </div>
          </motion.div>
        ))}

        {/* Hero content */}
        <motion.div
          className="relative z-10 mx-auto max-w-3xl"
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0}>
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6C4EFF]/25 bg-[#6C4EFF]/8 px-4 py-1.5 text-sm font-medium text-[#6C4EFF]">
              ✨ Free AI-powered browser utilities
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="mt-5 text-5xl font-bold leading-[1.1] tracking-tight text-[#111111] dark:text-white sm:text-6xl lg:text-7xl"
          >
            All the Tools You Need,{' '}
            <span className="bg-gradient-to-r from-[#6C4EFF] to-[#9B7BFF] bg-clip-text text-transparent">
              All in One Place
            </span>
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[#666666] dark:text-neutral-400"
          >
            Free AI-powered utility tools that help you work faster and smarter.
          </motion.p>

          {/* Search bar */}
          <motion.div variants={fadeUp} custom={0.3} className="mx-auto mt-10 max-w-xl">
            <SearchBar />
          </motion.div>

          {/* Pills */}
          <motion.div
            variants={fadeUp}
            custom={0.4}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {['Free', 'Fast', 'Secure', 'No Sign Up'].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ECECEC] bg-[#F8F9FC] px-3.5 py-1 text-sm text-[#666666] dark:border-border dark:bg-muted dark:text-muted-foreground"
              >
                <Check className="h-3.5 w-3.5 text-[#6C4EFF]" />
                {pill}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <section className="px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-8 text-center text-2xl font-bold text-[#111111] dark:text-white">
            Browse by Category
          </h2>
          {/* Horizontal scroll on mobile, flex-wrap on desktop */}
          <div className="flex gap-5 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.name} href={cat.path}>
                <motion.div
                  className="flex min-w-[80px] flex-col items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.08, y: -5 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  // @ts-ignore
                  custom={i}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#ECECEC] text-2xl shadow-sm dark:border-border"
                    style={{ backgroundColor: cat.bg }}
                  >
                    {cat.emoji}
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium text-[#111111] dark:text-white">
                    {cat.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Popular Tools Grid ────────────────────────────────────────── */}
      <section className="px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#6C4EFF]">
                Explore
              </p>
              <h2 className="text-2xl font-bold text-[#111111] dark:text-white">Popular Tools</h2>
            </div>
            <Link
              href="/text-tools"
              className="text-sm font-medium text-[#6C4EFF] transition-opacity hover:opacity-70"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR_TOOLS.map((tool, i) => (
              <motion.div
                key={tool.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
              >
                <Link href={getToolRoutePath(tool)}>
                  <div className="group relative h-full cursor-pointer rounded-[20px] border border-[#ECECEC] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(108,78,255,0.10)] dark:border-border dark:bg-card">
                    {/* Icon */}
                    <div
                      className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${TOOL_ICON_COLORS[i % TOOL_ICON_COLORS.length]}18` }}
                    >
                      <Cpu
                        className="h-5 w-5"
                        style={{ color: TOOL_ICON_COLORS[i % TOOL_ICON_COLORS.length] }}
                      />
                    </div>
                    {/* Arrow */}
                    <div className="absolute right-4 top-4 text-[#ECECEC] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#6C4EFF] dark:text-border">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <p className="mb-1 font-semibold text-[#111111] dark:text-white">{tool.name}</p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#666666] dark:text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section className="px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-[20px] border border-[#ECECEC] bg-[#F8F9FC] p-6 dark:border-border dark:bg-card"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C4EFF]/10 text-sm font-bold text-[#6C4EFF]">
                ✓
              </div>
              <p className="mb-1 font-bold text-[#111111] dark:text-white">{f.title}</p>
              <p className="text-sm text-[#666666] dark:text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
