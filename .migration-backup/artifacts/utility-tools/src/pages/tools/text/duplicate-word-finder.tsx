import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function DuplicateWordFinder() {
  const tool = getToolBySlug('duplicate-word-finder')!;
  const [text, setText] = useState('');
  const [duplicates, setDuplicates] = useState<{word: string, count: number}[]>([]);

  const findDuplicates = () => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const counts: Record<string, number> = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    
    const dups = Object.entries(counts)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({word, count}));
      
    setDuplicates(dups);
  };

  return (
    <ToolLayout tool={tool} instructions="Enter text to find repeated words.">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Text</Label>
          <Textarea
            placeholder="Type or paste your text here..."
            className="min-h-[200px] resize-y text-base p-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <Button onClick={findDuplicates}>Find Duplicates</Button>

        {duplicates.length > 0 && (
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <h3 className="font-bold mb-4">Duplicate Words Found:</h3>
            <div className="flex flex-wrap gap-2">
              {duplicates.map(d => (
                <div key={d.word} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span className="font-semibold">{d.word}</span>
                  <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {duplicates.length === 0 && text.trim().length > 0 && (
          <div className="text-muted-foreground">Click find to search for duplicates.</div>
        )}
      </div>
    </ToolLayout>
  );
}
