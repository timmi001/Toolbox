import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function SitemapGenerator() {
  const tool = getToolBySlug('sitemap-generator')!;
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [pages, setPages] = useState('/,/about,/contact,/blog');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    const urls = pages.split(',').map((page) => page.trim()).filter(Boolean);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((page) => `  <url><loc>${baseUrl}${page.startsWith('/') ? page : `/${page}`}</loc></url>`).join('\n')}
</urlset>`;
  }, [baseUrl, pages]);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool} instructions="Enter your site URL and a comma-separated list of pages to generate a basic XML sitemap snippet.">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Base URL</span>
            <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Pages (comma separated)</span>
            <textarea value={pages} onChange={(e) => setPages(e.target.value)} className="min-h-24 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">XML sitemap</span>
            <Button size="sm" variant="outline" onClick={copySnippet}>{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-xs leading-6">{snippet}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
