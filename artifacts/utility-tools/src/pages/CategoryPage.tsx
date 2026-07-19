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
  'ai-study-exams-tools': { title: 'AI Study & Exams', desc: 'Study notes, quizzes, flashcards, homework help, planners, and JAMB prep tools for smarter revision.' },
  'ai-ghostwriting-tools': { title: 'AI Ghostwriting', desc: 'Create polished essays, stories, book outlines, chapters, and speeches with a guided writing workflow.' },
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
    categoryPath === 'ai-study-exams-tools' ? 'ai-study-exams' :
    categoryPath === 'ai-ghostwriting-tools' ? 'ai-ghostwriting' :
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

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <BreadcrumbNav category={mappedCategory} />

      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">{details.title}</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl">{details.desc}</p>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${categoryTools.length} ${details.title.toLowerCase()}...`}
            className="pl-9 bg-card border-border/50"
          />
        </div>
      </header>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
