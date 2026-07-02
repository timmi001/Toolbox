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
  'seo-tools': { title: 'SEO Tools', desc: 'Create meta tags, sitemaps, schema markup, and social preview snippets for better search visibility.' },
  'image-tools': { title: 'Image Tools', desc: 'Compress, crop, resize, and convert images entirely in your browser.' },
  'file-conversion-tools': { title: 'File Conversion Tools', desc: 'Convert documents, archives, spreadsheets, and media formats in a few clicks.' },
  'pdf-tools': { title: 'PDF Tools', desc: 'Merge, split, and manipulate PDF documents securely.' },
  'calculators': { title: 'Calculators & Converters', desc: 'Solve math problems, convert units, and calculate dates.' },
};

export default function CategoryPage() {
  const [match, params] = useRoute('/:category');
  const [search, setSearch] = useState('');

  const categoryPath = params?.category ?? '';
  const details = CATEGORY_DETAILS[categoryPath];

  const mappedCategory: ToolCategory =
    categoryPath === 'text-tools' ? 'text' :
    categoryPath === 'developer-tools' ? 'developer' :
    categoryPath === 'seo-tools' ? 'seo' :
    categoryPath === 'image-tools' ? 'image' :
    categoryPath === 'file-conversion-tools' ? 'file-conversion' :
    categoryPath === 'pdf-tools' ? 'pdf' : 'calculators';

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
