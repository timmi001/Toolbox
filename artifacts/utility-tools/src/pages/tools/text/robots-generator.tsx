import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function RobotsGenerator() {
  const tool = getToolBySlug('robots-generator')!;
  const [siteUrl, setSiteUrl] = useState('https://example.com');
  const [allow, setAllow] = useState('/');
  const [disallow, setDisallow] = useState('/private/');
  const [sitemap, setSitemap] = useState('https://example.com/sitemap.xml');
  const [crawlDelay, setCrawlDelay] = useState('10');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => `User-agent: *
Allow: ${allow}
Disallow: ${disallow}
Crawl-delay: ${crawlDelay}
Sitemap: ${sitemap}
Host: ${siteUrl}`,[allow, disallow, crawlDelay, sitemap, siteUrl]);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool} instructions="Generate a robots.txt block for your site, including sitemap and crawl policy.">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          {[
            { label: 'Site URL', value: siteUrl, setter: setSiteUrl },
            { label: 'Allow path', value: allow, setter: setAllow },
            { label: 'Disallow path', value: disallow, setter: setDisallow },
            { label: 'Sitemap URL', value: sitemap, setter: setSitemap },
            { label: 'Crawl delay', value: crawlDelay, setter: setCrawlDelay },
          ].map((field) => (
            <label key={field.label} className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{field.label}</span>
              <input type="text" value={field.value as string} onChange={(e) => field.setter(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
            </label>
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">robots.txt</span>
            <Button size="sm" variant="outline" onClick={copySnippet}>{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-xs leading-6">{snippet}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
