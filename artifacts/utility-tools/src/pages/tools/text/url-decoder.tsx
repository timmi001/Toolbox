import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function UrlDecoder() {
  const tool = getToolBySlug('url-decoder')!;
  const [text, setText] = useState('');
  const [decoded, setDecoded] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      setDecoded(decodeURIComponent(text));
    } catch (e) {
      setDecoded('Invalid URL encoding');
    }
  }, [text]);

  const copy = async () => {
    await copyToClipboard(decoded);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} instructions="Enter percent-encoded URL text to decode it.">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Encoded Text</Label>
          <Textarea
            placeholder="Type or paste your encoded text here..."
            className="min-h-[150px] resize-y text-base p-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label>Decoded Result</Label>
            <Button size="sm" onClick={copy} variant="secondary">Copy</Button>
          </div>
          <Textarea
            readOnly
            className="min-h-[150px] resize-y text-base p-4 bg-muted/30 font-mono"
            value={decoded}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
