import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function UrlEncoder() {
  const tool = getToolBySlug('url-encoder')!;
  const [text, setText] = useState('');
  const [encoded, setEncoded] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      setEncoded(encodeURIComponent(text));
    } catch (e) {
      setEncoded('Error encoding URL');
    }
  }, [text]);

  const copy = async () => {
    await copyToClipboard(encoded);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter a string or URL to encode it using percent-encoding.">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Text to Encode</Label>
          <Textarea
            placeholder="Type or paste your text here..."
            className="min-h-[150px] resize-y text-base p-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Encoded Result</Label>
            <Button size="sm" onClick={copy} variant="secondary">Copy</Button>
          </div>
          <Textarea
            readOnly
            className="min-h-[150px] resize-y text-base p-4 bg-muted/30 font-mono"
            value={encoded}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
