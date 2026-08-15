import { useEffect, useRef } from 'react';
import { Tool } from '@/lib/tools-data';
import { useSEO } from '@/hooks/useSEO';
import { useRecentTools } from '@/hooks/useRecentTools';
import { BreadcrumbNav } from './BreadcrumbNav';
import { RelatedTools } from './RelatedTools';
import { ToolFAQ } from './ToolFAQ';

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

  const socialRef = useRef<HTMLDivElement | null>(null);

  // Insert requested social bar ad script once when tool pages mount.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const src = 'https://pl30830725.effectivecpmnetwork.com/36/7e/ab/367eab3f1c8e1d8e69baa350789349e7.js';
    if (!socialRef.current) return;
    // Avoid injecting the same script multiple times
    if (document.querySelector(`script[src="${src}"]`)) return;

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    socialRef.current.appendChild(s);

    return () => {
      try {
        if (s.parentNode) s.parentNode.removeChild(s);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // No ad scripts or external ad vendors on tool pages.

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BreadcrumbNav category={tool.category} toolName={tool.name} />

      {/* Social bar ad — injected script will render here */}
      <div ref={socialRef} id="social-bar" className="w-full mb-4" />

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

      {/* Bottom area (ads removed) */}

      {faqs.length > 0 && <ToolFAQ faqs={faqs} />}
      
      <RelatedTools category={tool.category} currentSlug={tool.slug} />
    </div>
  );
}
