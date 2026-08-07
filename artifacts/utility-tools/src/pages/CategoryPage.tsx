import { useRoute } from 'wouter';
import { toolsData, ToolCategory } from '@/lib/tools-data';
import { ToolCard } from '@/components/ToolCard';
import { useSEO } from '@/hooks/useSEO';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

const CATEGORY_DETAILS: Record<string, { title: string, desc: string }> = {
  'text-tools': { title: 'Text Tools', desc: 'Format, count, clean, and manipulate text with our comprehensive suite of text utilities.' },
  'developer-tools': { title: 'Developer Tools', desc: 'JSON formatters, encoders, hashes, and essential utilities for developers.' },
  'image-tools': { title: 'Image Tools', desc: 'Compress, crop, resize, and convert images entirely in your browser.' },
  'file-conversion-tools': { title: 'File Conversion Tools', desc: 'Convert documents, archives, spreadsheets, and media formats in a few clicks.' },
  'business-tools': { title: 'Business Tools', desc: 'Create invoices, receipts, labels, business names, and simple financial insights.' },
  'pdf-tools': { title: 'PDF Tools', desc: 'Merge, split, and manipulate PDF documents securely.' },
  'calculators': { title: 'Calculators & Converters', desc: 'Solve math problems, convert units, and calculate dates.' },
  'ai-marketing-advertising': { title: 'AI Marketing & Advertising', desc: 'Create ad copy, sales messaging, landing page content, and conversion-focused CTAs with AI-powered marketing tools.' },
  'audio-tools': { title: 'Audio Tools', desc: 'Record, trim, merge, convert, and enhance audio files entirely in your browser — no installs needed.' },
  'video-tools': { title: 'Video Tools', desc: 'Trim, merge, compress, rotate, subtitle, and convert videos with simple browser-based tools.' },
  'ai-resume-tools': { title: 'AI Resume Tools', desc: 'Build resumes, cover letters, LinkedIn headlines, and professional bios with AI.' },
  'ai-social-media-tools': { title: 'AI Social Media Tools', desc: 'Generate captions, posts, and descriptions for Instagram, X, TikTok, LinkedIn, and YouTube.' },
  'ai-blogging-seo-tools': { title: 'AI Blogging & SEO Tools', desc: 'Write blog titles, outlines, articles, and SEO meta tags with AI.' },
  'ai-email-tools': { title: 'AI Email Tools', desc: 'Draft cold emails, sales emails, follow-ups, support replies, and thank-you notes.' },
  'ai-grammar-tools': { title: 'AI Grammar & Writing Tools', desc: 'Check grammar, improve tone, summarize, paraphrase, and proofread any text.' },
  'ai-ghostwriting-tools': { title: 'AI Ghostwriting', desc: 'Create polished essays, stories, book outlines, chapters, and speeches with a guided writing workflow.' },
  'ai-event-tools': { title: 'AI Events & Ticketing', desc: 'Create polished event concepts, day-of itineraries, checklists, and guest-ready invites for launches, weddings, birthdays, and professional gatherings.' },
};

export default function CategoryPage() {
  const [match, params] = useRoute('/:category');
  const [search, setSearch] = useState('');

  const categoryPath = params?.category ?? '';
  const details = CATEGORY_DETAILS[categoryPath];

  const mappedCategory: ToolCategory =
    categoryPath === 'text-tools' ? 'text' :
    categoryPath === 'developer-tools' ? 'developer' :
    categoryPath === 'image-tools' ? 'image' :
    categoryPath === 'file-conversion-tools' ? 'file-conversion' :
    categoryPath === 'business-tools' ? 'business' :
    categoryPath === 'pdf-tools' ? 'pdf' :
    categoryPath === 'ai-marketing-advertising' ? 'marketing' :
    categoryPath === 'audio-tools' ? 'audio' :
    categoryPath === 'video-tools' ? 'video' :
    categoryPath === 'ai-resume-tools' ? 'ai-resume' :
    categoryPath === 'ai-social-media-tools' ? 'ai-social' :
    categoryPath === 'ai-blogging-seo-tools' ? 'ai-blogging-seo' :
    categoryPath === 'ai-email-tools' ? 'ai-email' :
    categoryPath === 'ai-grammar-tools' ? 'ai-grammar' :
    categoryPath === 'ai-ghostwriting-tools' ? 'ai-ghostwriting' :
    categoryPath === 'ai-event-tools' ? 'ai-events' :
    'calculators';

  useSEO(
    details ? `${details.title} | ToolKit` : 'ToolKit',
    details?.desc ?? ''
  );

  if (!match || !categoryPath) return null;
  if (!details) return <div>Category not found</div>;

  const categoryTools = toolsData.filter(t => t.category === mappedCategory);

  const filteredTools = categoryTools.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const eventHighlights = [
    {
      title: 'Concept to execution',
      text: 'Turn a simple idea into a complete event plan with theme direction, flow, and logistics.'
    },
    {
      title: 'Guest-ready messaging',
      text: 'Draft polished invites, announcements, and reminders for every audience and tone.'
    },
    {
      title: 'Day-of confidence',
      text: 'Build schedules, checklists, and hosting notes so your event runs smoothly from start to finish.'
    },
  ];

  return (
    <div className="py-5 animate-in fade-in duration-500">
      <BreadcrumbNav category={mappedCategory} />

      <header className="mb-6 space-y-4">
        <div className="rounded-[24px] border border-border/60 bg-gradient-to-br from-[#F59E0B]/10 via-white to-[#7C3AED]/10 p-5 shadow-sm dark:bg-card/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#B45309]">
              Premium planning suite
            </span>
            <span className="rounded-full border border-border/50 bg-white/70 px-3 py-1 text-xs text-muted-foreground dark:bg-card/70">
              {categoryTools.length} specialized tools
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{details.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{details.desc}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {eventHighlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/50 bg-white/80 p-3 text-sm shadow-sm dark:bg-background/60">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${categoryTools.length} ${details.title.toLowerCase()}...`}
            className="pl-9 bg-card border-border/50 h-9 text-sm"
          />
        </div>
      </header>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filteredTools.map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No tools found matching "{search}".
        </div>
      )}
    </div>
  );
}
