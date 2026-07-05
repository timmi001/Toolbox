import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export default function RemoveDuplicateLines() {
  const tool = getToolBySlug('remove-duplicate-lines')!;
  const [text, setText] = useState('');
  const [removedCount, setRemovedCount] = useState(0);
  const { toast } = useToast();

  const process = () => {
    const lines = text.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    setText(uniqueLines.join('\n'));
    setRemovedCount(lines.length - uniqueLines.length);
  };

  const copy = async () => {
    await copyToClipboard(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text with duplicate lines, then click process.">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={process} variant="secondary">Remove Duplicates</Button>
        <Button onClick={copy} className="ml-auto">Copy text</Button>
      </div>
      {removedCount > 0 && (
        <div className="mb-4 text-sm text-green-500">
          Removed {removedCount} duplicate line(s).
        </div>
      )}
      <Textarea
        placeholder="Type or paste your text here..."
        className="min-h-[300px] resize-y text-base p-4"
        value={text}
        onChange={(e) => { setText(e.target.value); setRemovedCount(0); }}
      />
    </ToolLayout>
  );
}
