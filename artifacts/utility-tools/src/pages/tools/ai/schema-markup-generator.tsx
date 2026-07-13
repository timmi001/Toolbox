import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function SchemaMarkupGenerator() {
  const tool = getToolBySlug('schema-markup-generator')!;
  const [type, setType] = useState('Organization');
  const [name, setName] = useState('Example Brand');
  const [description, setDescription] = useState('A helpful brand with creative tools.');
  const [url, setUrl] = useState('https://example.com');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => `{
  "@context": "https://schema.org",
  "@type": "${type}",
  "name": "${name}",
  "description": "${description}",
  "url": "${url}"
}`,[type, name, description, url]);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool} instructions="Select a schema type and fill in your business or site details to generate JSON-LD markup.">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Schema type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm">
              <option>Organization</option>
              <option>WebSite</option>
              <option>Product</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">URL</span>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">JSON-LD</span>
            <Button size="sm" variant="outline" onClick={copySnippet}>{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-xs leading-6">{snippet}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
