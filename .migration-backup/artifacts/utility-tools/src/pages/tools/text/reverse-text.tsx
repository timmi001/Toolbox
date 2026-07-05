import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function ReverseText() {
  const tool = getToolBySlug('reverse-text')!;
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleReverseAll = () => {
    setText(text.split('').reverse().join(''));
  };

  const handleReverseWords = () => {
    setText(text.split(' ').map(word => word.split('').reverse().join('')).join(' '));
  };

  const copy = async () => {
    await copyToClipboard(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text and choose how you want to reverse it.">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={handleReverseAll} variant="secondary">Reverse Entire Text</Button>
        <Button onClick={handleReverseWords} variant="secondary">Reverse Each Word</Button>
        <Button onClick={copy} className="ml-auto">Copy text</Button>
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
