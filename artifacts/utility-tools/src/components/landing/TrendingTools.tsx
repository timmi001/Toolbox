import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Image, FileStack, QrCode, AlignLeft, Minimize2, Key, Braces } from 'lucide-react';

interface TrendingTool {
  name: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const TRENDING: TrendingTool[] = [
  { name: 'AI Chat',           href: '/tools/ai/ai-writer',             icon: <MessageSquare className="h-5 w-5" />, color: '#7C3AED', bg: '#7C3AED12' },
  { name: 'Image Compressor',  href: '/tools/image/image-compressor',   icon: <Image className="h-5 w-5" />,          color: '#F59E0B', bg: '#F59E0B12' },
  { name: 'PDF Merge',         href: '/tools/pdf/merge-pdf',            icon: <FileStack className="h-5 w-5" />,      color: '#EF4444', bg: '#EF444412' },
  { name: 'QR Generator',      href: '/tools/developer/qr-generator',   icon: <QrCode className="h-5 w-5" />,         color: '#10B981', bg: '#10B98112' },
  { name: 'Text Summarizer',   href: '/tools/ai/ai-summarizer',         icon: <AlignLeft className="h-5 w-5" />,      color: '#6366F1', bg: '#6366F112' },
  { name: 'Image Generator',   href: '/tools/image/image-compressor',   icon: <Minimize2 className="h-5 w-5" />,      color: '#EC4899', bg: '#EC489912' },
  { name: 'Password Generator',href: '/tools/developer/password-generator', icon: <Key className="h-5 w-5" />,        color: '#14B8A6', bg: '#14B8A612' },
  { name: 'JSON Formatter',    href: '/tools/developer/json-formatter',  icon: <Braces className="h-5 w-5" />,        color: '#F97316', bg: '#F9731612' },
];

export function TrendingTools() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">Trending</p>
          <h2 className="text-2xl font-bold text-[#111827] dark:text-white">Popular Right Now</h2>
        </motion.div>

        {/* Horizontal scroll cards */}
        <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRENDING.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -5 }}
            >
              <Link href={tool.href}>
                <div className="group flex min-w-[160px] cursor-pointer flex-col gap-3 rounded-[20px] border border-border/60 bg-white p-5 transition-all duration-300 hover:border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:bg-card">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: tool.bg, color: tool.color }}
                  >
                    {tool.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] dark:text-white">{tool.name}</p>
                    <ArrowRight
                      className="mt-1 h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:opacity-100"
                      style={{ color: tool.color }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
