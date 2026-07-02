import { Link } from 'wouter';
import { Type, Code, Image as ImageIcon, FileText, Calculator, Search, FileStack, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getToolsByCategory } from '@/lib/tools-data';

const CATEGORIES = [
  { id: 'text', name: 'Text Tools', icon: Type, path: '/text-tools', desc: 'Format, count, and clean text effortlessly.' },
  { id: 'developer', name: 'Developer Tools', icon: Code, path: '/developer-tools', desc: 'JSON, Base64, Hash, and more dev utilities.' },
  { id: 'seo', name: 'SEO Tools', icon: Search, path: '/seo-tools', desc: 'Generate meta tags, sitemaps, schema, and social previews.' },
  { id: 'image', name: 'Image Tools', icon: ImageIcon, path: '/image-tools', desc: 'Compress, crop, resize, and convert images.' },
  { id: 'file-conversion', name: 'File Conversion Tools', icon: FileStack, path: '/file-conversion-tools', desc: 'Convert media, documents, archives, and spreadsheets.' },
  { id: 'business', name: 'Business Tools', icon: Briefcase, path: '/business-tools', desc: 'Create invoices, receipts, stickers, and business-ready assets.' },
  { id: 'pdf', name: 'PDF Tools', icon: FileText, path: '/pdf-tools', desc: 'Merge, split, and manipulate PDF documents.' },
  { id: 'calculators', name: 'Calculators & Converters', icon: Calculator, path: '/calculators', desc: 'Math, dates, and unit conversions.' },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CATEGORIES.map(cat => {
        const count = getToolsByCategory(cat.id as any).length;
        const Icon = cat.icon;

        return (
          <Link key={cat.id} href={cat.path}>
            <Card className="h-full hover:border-primary/50 transition-colors bg-card/40 backdrop-blur-sm group cursor-pointer border-border/50">
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">{cat.name}</CardTitle>
                <CardDescription className="text-sm mb-4">
                  {cat.desc}
                </CardDescription>
                <div className="text-xs font-semibold text-primary/80 bg-primary/10 inline-block px-2 py-1 rounded">
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
