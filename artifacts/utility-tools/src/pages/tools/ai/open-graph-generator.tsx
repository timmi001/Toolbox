import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function OpenGraphGenerator() {
  const tool = getToolBySlug('open-graph-generator')!;
  const [title, setTitle] = useState('My Website');
  const [description, setDescription] = useState('A polished online experience with useful tools.');
  const [url, setUrl] = useState('https://example.com');
  const [image, setImage] = useState('https://example.com/og-image.png');
  const [siteName, setSiteName] = useState('Example');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => `<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="${siteName}" />`, [title, description, url, image, siteName]);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool} instructions="Populate the social preview fields and copy open graph tags for Facebook, LinkedIn, and other social platforms.">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          {[
            { label: 'Title', value: title, setter: setTitle },
            { label: 'Description', value: description, setter: setDescription },
            { label: 'URL', value: url, setter: setUrl },
            { label: 'Image URL', value: image, setter: setImage },
            { label: 'Site name', value: siteName, setter: setSiteName },
          ].map((field) => (
            <label key={field.label} className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{field.label}</span>
              {field.label === 'Description' ? (
                <textarea value={field.value as string} onChange={(e) => field.setter(e.target.value)} className="min-h-24 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
              ) : (
                <input type="text" value={field.value as string} onChange={(e) => field.setter(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
              )}
            </label>
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Open Graph tags</span>
            <Button size="sm" variant="outline" onClick={copySnippet}>{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-xs leading-6">{snippet}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
