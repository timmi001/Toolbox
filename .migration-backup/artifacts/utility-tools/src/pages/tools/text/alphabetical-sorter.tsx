import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function AlphabeticalSorter() {
  const tool = getToolBySlug('alphabetical-sorter')!;
  const [text, setText] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const { toast } = useToast();

  const sortLines = (descending: boolean) => {
    const lines = text.split('\n');
    lines.sort((a, b) => {
      const cmpA = caseInsensitive ? a.toLowerCase() : a;
      const cmpB = caseInsensitive ? b.toLowerCase() : b;
      if (cmpA < cmpB) return descending ? 1 : -1;
      if (cmpA > cmpB) return descending ? -1 : 1;
      return 0;
    });
    setText(lines.join('\n'));
  };

  const copy = async () => {
    await copyToClipboard(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text to sort its lines alphabetically.">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Button onClick={() => sortLines(false)} variant="secondary">Sort A-Z</Button>
        <Button onClick={() => sortLines(true)} variant="secondary">Sort Z-A</Button>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="case-insensitive" 
            checked={caseInsensitive} 
            onCheckedChange={(c) => setCaseInsensitive(c === true)}
          />
          <Label htmlFor="case-insensitive">Case Insensitive</Label>
        </div>
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
