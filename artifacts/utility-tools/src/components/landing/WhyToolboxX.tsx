import { motion } from 'framer-motion';
import { Cpu, History, Zap, Smartphone, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: <Cpu className="h-5 w-5" />,
    title: 'AI + Utility Tools',
    description: 'The only platform combining 200+ AI and everyday utility tools in one place.',
    color: '#7C3AED',
    bg: '#7C3AED10',
  },
  {
    icon: <History className="h-5 w-5" />,
    title: 'Save Tool History',
    description: 'Every AI result is saved locally so you can revisit and reuse your work anytime.',
    color: '#10B981',
    bg: '#10B98110',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Fast Processing',
    description: 'Everything runs in your browser. No uploads, no waiting, near-instant results.',
    color: '#F59E0B',
    bg: '#F59E0B10',
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: 'Mobile Friendly',
    description: 'A fully responsive experience that feels great on any device, any screen size.',
    color: '#3B82F6',
    bg: '#3B82F610',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Privacy First',
    description: 'Your data never leaves your device. No tracking, no selling your information.',
    color: '#EC4899',
    bg: '#EC489910',
  },
];

export function WhyToolboxX() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">Why ToolboxX</p>
          <h2 className="text-3xl font-bold text-[#111827] dark:text-white">Built different</h2>
          <p className="mt-3 text-[#6B7280] dark:text-neutral-400">
            Everything we build starts with one question: is this genuinely useful?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ y: -5 }}
              className="rounded-[22px] border border-border/60 bg-card p-6 transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="mb-2 font-bold text-[#111827] dark:text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#6B7280] dark:text-muted-foreground">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
