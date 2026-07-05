import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function HtmlDecoder() {
  const tool = getToolBySlug('html-decoder')!;
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  return (
    <ToolLayout tool={tool} instructions="Paste HTML-encoded text to decode HTML entities back to characters.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Encoded Input</label>
          <Textarea placeholder='&lt;div&gt;Hello &amp; World&lt;/div&gt;' className="min-h-[200px] font-mono text-sm resize-y" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Decoded Output</label>
          <Textarea readOnly value={output} className="min-h-[200px] font-mono text-sm resize-y bg-muted/30" placeholder="Decoded output..." />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy Output'}</Button>
        <Button variant="outline" onClick={() => setInput('')}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
