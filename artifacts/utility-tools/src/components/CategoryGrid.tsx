import { Link } from 'wouter';
import { Type, Code, Image as ImageIcon, FileText, Calculator, FileStack, Briefcase, Sparkles, Music, Video, Megaphone, FileBadge, Share2, Newspaper, SpellCheck2, Mail, GraduationCap, PenLine, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getToolsByCategory } from '@/lib/tools-data';

const CATEGORIES = [
  { id: 'marketing', name: 'AI Marketing & Advertising', icon: Megaphone, path: '/ai-marketing-advertising', desc: 'Create ad copy, sales messaging, landing pages, and CTAs with AI.', accent: 'from-fuchsia-500/15 via-violet-500/10 to-transparent' },
  { id: 'ai-resume', name: 'AI Resume Tools', icon: FileBadge, path: '/ai-resume-tools', desc: 'Build resumes, cover letters, LinkedIn headlines, and professional bios with AI.', accent: 'from-sky-500/15 via-cyan-500/10 to-transparent' },
  { id: 'ai-social', name: 'AI Social Media Tools', icon: Share2, path: '/ai-social-media-tools', desc: 'Generate captions, posts, and descriptions for Instagram, X, TikTok, LinkedIn, and YouTube.', accent: 'from-amber-500/15 via-orange-500/10 to-transparent' },
  { id: 'ai-blogging-seo', name: 'AI Blogging & SEO Tools', icon: Newspaper, path: '/ai-blogging-seo-tools', desc: 'Write blog titles, outlines, articles, and SEO meta tags with AI.', accent: 'from-emerald-500/15 via-green-500/10 to-transparent' },
  { id: 'ai-email', name: 'AI Email Tools', icon: Mail, path: '/ai-email-tools', desc: 'Draft cold emails, sales emails, follow-ups, support replies, and thank-you notes.', accent: 'from-indigo-500/15 via-blue-500/10 to-transparent' },
  { id: 'ai-grammar', name: 'AI Grammar & Writing Tools', icon: SpellCheck2, path: '/ai-grammar-tools', desc: 'Check grammar, improve tone, summarize, paraphrase, and proofread any text.', accent: 'from-rose-500/15 via-pink-500/10 to-transparent' },
  { id: 'ai-study-exams', name: 'AI Study & Exams', icon: GraduationCap, path: '/ai-study-exams-tools', desc: 'Study notes, quizzes, flashcards, planners, and JAMB prep tools.', accent: 'from-lime-500/15 via-emerald-500/10 to-transparent' },
  { id: 'ai-ghostwriting', name: 'AI Ghostwriting', icon: PenLine, path: '/ai-ghostwriting-tools', desc: 'Create polished essays, stories, book outlines, chapters, and speeches.', accent: 'from-purple-500/15 via-violet-500/10 to-transparent' },
  { id: 'text', name: 'Text Tools', icon: Type, path: '/text-tools', desc: 'Format, count, and clean text effortlessly.', accent: 'from-slate-500/15 via-zinc-500/10 to-transparent' },
  { id: 'developer', name: 'Developer Tools', icon: Code, path: '/developer-tools', desc: 'JSON, Base64, Hash, and more dev utilities.', accent: 'from-cyan-500/15 via-sky-500/10 to-transparent' },
  { id: 'image', name: 'Image Tools', icon: ImageIcon, path: '/image-tools', desc: 'Compress, crop, resize, and convert images.', accent: 'from-orange-500/15 via-amber-500/10 to-transparent' },
  { id: 'audio', name: 'Audio Tools', icon: Music, path: '/audio-tools', desc: 'Record, trim, merge, convert, and enhance audio.', accent: 'from-teal-500/15 via-emerald-500/10 to-transparent' },
  { id: 'video', name: 'Video Tools', icon: Video, path: '/video-tools', desc: 'Trim, compress, rotate, subtitle, and convert videos.', accent: 'from-pink-500/15 via-fuchsia-500/10 to-transparent' },
  { id: 'file-conversion', name: 'File Conversion', icon: FileStack, path: '/file-conversion-tools', desc: 'Convert media, documents, archives, and spreadsheets.', accent: 'from-blue-500/15 via-indigo-500/10 to-transparent' },
  { id: 'business', name: 'AI Business Tools', icon: Briefcase, path: '/business-tools', desc: 'Create invoices, receipts, stickers, and business-ready assets.', accent: 'from-violet-500/15 via-fuchsia-500/10 to-transparent' },
  { id: 'pdf', name: 'PDF Tools', icon: FileText, path: '/pdf-tools', desc: 'Merge, split, and manipulate PDF documents.', accent: 'from-red-500/15 via-rose-500/10 to-transparent' },
  { id: 'calculators', name: 'Calculators & Converters', icon: Calculator, path: '/calculators', desc: 'Math, dates, and unit conversions.', accent: 'from-emerald-500/15 via-lime-500/10 to-transparent' },
];

export function CategoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CATEGORIES.map((cat) => {
        const count = getToolsByCategory(cat.id as any).length;
        const Icon = cat.icon;

        return (
          <Link key={cat.id} href={cat.path}>
            <Card className={`group h-full cursor-pointer border-border/60 bg-gradient-to-br ${cat.accent} bg-card/70 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40`}>
              <CardHeader className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 text-primary shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                <CardTitle className="mt-5 text-xl font-semibold transition-colors group-hover:text-primary">{cat.name}</CardTitle>
                <CardDescription className="mt-2 text-sm leading-6">{cat.desc}</CardDescription>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {count} Tools
                </div>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
