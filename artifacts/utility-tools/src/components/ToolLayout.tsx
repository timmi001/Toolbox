import { useEffect } from 'react';
import { Tool } from '@/lib/tools-data';
import { useSEO } from '@/hooks/useSEO';
import { useRecentTools } from '@/hooks/useRecentTools';
import { BreadcrumbNav } from './BreadcrumbNav';
import { RelatedTools } from './RelatedTools';
import { ToolFAQ } from './ToolFAQ';
import { AdSlot } from './AdSlot';

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
  instructions?: React.ReactNode;
  faqs?: { question: string; answer: string }[];
}

export function ToolLayout({ tool, children, instructions, faqs = [] }: ToolLayoutProps) {
  useSEO(`${tool.name} - Free Online Tool | ToolKit`, tool.description);
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool(tool.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug]);

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BreadcrumbNav category={tool.category} toolName={tool.name} />
      
      <AdSlot className="mb-8" id="ad-header" />

      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          {tool.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {tool.description}
        </p>
      </header>

      {instructions && (
        <div className="mb-8 p-4 bg-muted/30 border border-border/50 rounded-lg text-sm text-muted-foreground">
          <strong className="text-foreground">How to use:</strong> {instructions}
        </div>
      )}

      <div className="bg-card border border-border shadow-xl rounded-xl p-6 md:p-8 mb-12">
        {children}
      </div>

      <AdSlot className="my-12" id="ad-in-content" />

      {faqs.length > 0 && <ToolFAQ faqs={faqs} />}
      
      <RelatedTools category={tool.category} currentSlug={tool.slug} />
    </div>
  );
}
