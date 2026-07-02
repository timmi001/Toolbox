import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';

export default function SerpPreview() {
  const tool = getToolBySlug('serp-preview')!;
  const [title, setTitle] = useState('Free Online Tools for Designers and Marketers');
  const [description, setDescription] = useState('Discover quick and useful utilities to support your workflow, boost SEO, and improve your creative process.');
  const [url, setUrl] = useState('example.com/tools');

  return (
    <ToolLayout tool={tool} instructions="Craft a title, description, and URL to preview how your search result may appear in Google.">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Title</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
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

        <div className="rounded-2xl border border-border/60 bg-background p-4">
          <div className="max-w-xl rounded-xl border border-border/50 bg-white p-4 text-left shadow-sm dark:bg-zinc-950">
            <div className="text-sm text-blue-700 dark:text-blue-400">{url}</div>
            <div className="text-xl font-medium text-blue-800 hover:underline dark:text-blue-300">{title}</div>
            <div className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
