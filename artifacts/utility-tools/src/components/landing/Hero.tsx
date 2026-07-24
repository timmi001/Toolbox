import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">

      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Purple blob */}
        <motion.div
          className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Green blob */}
        <motion.div
          className="absolute left-[65%] top-[60%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Soft grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#6B7280 1px, transparent 1px), linear-gradient(to right, #6B7280 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">

        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/8 px-4 py-1.5 text-sm font-medium text-[#7C3AED]">
            <Zap className="h-3.5 w-3.5" />
            200+ free tools — no sign up required
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          {...fadeUp(0.08)}
          className="mt-4 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#111827] dark:text-white sm:text-6xl lg:text-7xl"
        >
          AI That Works.{' '}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#9F67FF] to-[#10B981] bg-clip-text text-transparent">
            Utility Tools That Save Time.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          {...fadeUp(0.16)}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#6B7280] dark:text-neutral-400"
        >
          200+ free AI and utility tools for creators, students, developers and businesses.
        </motion.p>

        {/* Search bar */}
        <motion.div {...fadeUp(0.22)} className="mx-auto mt-10 max-w-xl">
          <SearchBar />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUp(0.3)}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/ai-grammar-tools">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/25 transition-shadow hover:shadow-[#7C3AED]/40"
            >
              Explore AI Tools
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
          <Link href="/text-tools">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/8 px-6 py-3 text-sm font-semibold text-[#10B981] transition-all hover:border-[#10B981]/60 hover:bg-[#10B981]/12"
            >
              Browse Utility Tools
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust pills */}
        <motion.div
          {...fadeUp(0.38)}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B7280] dark:text-neutral-500"
        >
          {['Free forever', 'No account needed', 'Privacy first', 'Works offline'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
