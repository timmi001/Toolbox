import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function SlugGenerator() {
  const tool = getToolBySlug('slug-generator')!;
  const [text, setText] = useState('');
  const [slug, setSlug] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const s = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(s);
  }, [text]);

  const copy = async () => {
    await copyToClipboard(slug);
    toast({ description: 'Slug copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text to automatically convert it into a URL-friendly slug.">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Original Text</Label>
          <Textarea
            placeholder="Type or paste your text here..."
            className="min-h-[100px] resize-y text-base p-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Generated Slug</Label>
            <Button size="sm" onClick={copy} variant="secondary">Copy</Button>
          </div>
          <div className="bg-muted p-4 rounded-lg min-h-[60px] break-all font-mono text-primary">
            {slug || 'your-slug-will-appear-here'}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
