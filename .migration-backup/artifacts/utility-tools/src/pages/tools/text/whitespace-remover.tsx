import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function WhitespaceRemover() {
  const tool = getToolBySlug('whitespace-remover')!;
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleTrim = (type: string) => {
    let result = text;
    switch (type) {
      case 'leading':
        result = result.replace(/^[ \t]+/gm, '');
        break;
      case 'trailing':
        result = result.replace(/[ \t]+$/gm, '');
        break;
      case 'both':
        result = result.replace(/^[ \t]+|[ \t]+$/gm, '');
        break;
      case 'all':
        result = result.replace(/\s+/g, '');
        break;
    }
    setText(result);
  };

  const copy = async () => {
    await copyToClipboard(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text and click a button to remove whitespace.">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={() => handleTrim('leading')} variant="secondary">Trim Leading</Button>
        <Button onClick={() => handleTrim('trailing')} variant="secondary">Trim Trailing</Button>
        <Button onClick={() => handleTrim('both')} variant="secondary">Trim Both</Button>
        <Button onClick={() => handleTrim('all')} variant="secondary">Remove All Whitespace</Button>
        <Button onClick={copy} className="ml-auto" variant="outline">Copy text</Button>
      </div>
      <Textarea
        placeholder="Type or paste your text here..."
        className="min-h-[300px] resize-y text-base p-4 font-mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </ToolLayout>
  );
}
