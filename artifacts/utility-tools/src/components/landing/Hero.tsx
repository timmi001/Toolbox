import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Wrench, Zap } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp = (delay = 0): any => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

export function Hero() {
  return (
    <section
      className="w-full px-4 pb-5 pt-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(135deg, #120c22 0%, #17132a 45%, #0b1d18 100%)',
      }}
    >
      <div className="mx-auto max-w-[1400px]">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="mb-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/90 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            200+ free tools — no sign up required
          </span>
        </motion.div>

        {/* Feature cards — always side by side */}
        <div className="grid grid-cols-2 gap-3">

          {/* AI Tools */}
          <motion.div
            {...fadeUp(0.08)}
            whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-xl p-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #4B0082 0%, #7C3AED 65%, #5B21B6 100%)',
              boxShadow: '0 8px 28px rgba(75,0,130,0.22)',
            }}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-3">
              {/* Header row */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">AI Tools</h3>
                  <p className="text-[11px] leading-snug text-white/70">Writing, coding, business & more</p>
                </div>
              </div>
              {/* CTA */}
              <Link href="/ai-tools">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-md ring-1 ring-white/20 transition-all hover:bg-white/20 hover:shadow-lg"
                >
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Utility Tools */}
          <motion.div
            {...fadeUp(0.14)}
            whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-xl p-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 65%, #047857 100%)',
              boxShadow: '0 8px 28px rgba(5,150,105,0.22)',
            }}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-3">
              {/* Header row */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Utility Tools</h3>
                  <p className="text-[11px] leading-snug text-white/70">PDFs, images, files & calculators</p>
                </div>
              </div>
              {/* CTA */}
              <Link href="/utility-tools">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-md ring-1 ring-white/20 transition-all hover:bg-white/20 hover:shadow-lg"
                >
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
