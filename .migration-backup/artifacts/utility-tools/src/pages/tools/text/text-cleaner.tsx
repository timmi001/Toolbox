import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function TextCleaner() {
  const tool = getToolBySlug('text-cleaner')!;
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleClean = (type: string) => {
    let result = text;
    switch (type) {
      case 'extra-spaces':
        result = result.replace(/[ \t]+/g, ' ');
        break;
      case 'empty-lines':
        result = result.replace(/^\s*[\r\n]/gm, '');
        break;
      case 'special-chars':
        result = result.replace(/[^\w\s\.,!?]/g, '');
        break;
      case 'html-tags':
        result = result.replace(/<[^>]*>?/gm, '');
        break;
      case 'all':
        result = result.replace(/[ \t]+/g, ' ').replace(/^\s*[\r\n]/gm, '').trim();
        break;
    }
    setText(result);
  };

  const copy = async () => {
    await copyToClipboard(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text and click a button to clean it.">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={() => handleClean('extra-spaces')} variant="secondary">Remove Extra Spaces</Button>
        <Button onClick={() => handleClean('empty-lines')} variant="secondary">Remove Empty Lines</Button>
        <Button onClick={() => handleClean('special-chars')} variant="secondary">Remove Special Chars</Button>
        <Button onClick={() => handleClean('html-tags')} variant="secondary">Strip HTML</Button>
        <Button onClick={() => handleClean('all')} variant="default">Clean All</Button>
        <Button onClick={copy} className="ml-auto" variant="outline">Copy text</Button>
      </div>
      <Textarea
        placeholder="Type or paste your text here..."
        className="min-h-[300px] resize-y text-base p-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </ToolLayout>
  );
}
