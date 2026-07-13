import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function MetaTagGenerator() {
  const tool = getToolBySlug('meta-tag-generator')!;
  const [title, setTitle] = useState('My Awesome Tool');
  const [description, setDescription] = useState('A modern utility website with fast, free tools for creators and developers.');
  const [keywords, setKeywords] = useState('tools, online utility, seo');
  const [author, setAuthor] = useState('Your Name');
  const [robots, setRobots] = useState('index, follow');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="keywords" content="${keywords}" />
<meta name="author" content="${author}" />
<meta name="robots" content="${robots}" />`, [title, description, keywords, author, robots]);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool} instructions="Fill in the details and copy a ready-to-use set of meta tags for your page.">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          {[
            { label: 'Page title', value: title, setter: setTitle, type: 'text' },
            { label: 'Description', value: description, setter: setDescription, type: 'textarea' },
            { label: 'Keywords', value: keywords, setter: setKeywords, type: 'text' },
            { label: 'Author', value: author, setter: setAuthor, type: 'text' },
            { label: 'Robots', value: robots, setter: setRobots, type: 'text' },
          ].map((field) => (
            <label key={field.label} className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea value={field.value as string} onChange={(e) => field.setter(e.target.value)} className="min-h-24 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
              ) : (
                <input type="text" value={field.value as string} onChange={(e) => field.setter(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
              )}
            </label>
          ))}
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Generated HTML</span>
            <Button size="sm" variant="outline" onClick={copySnippet}>{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-xs leading-6">{snippet}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
