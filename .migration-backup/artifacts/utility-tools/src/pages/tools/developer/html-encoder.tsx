import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function HtmlEncoder() {
  const tool = getToolBySlug('html-encoder')!;
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  return (
    <ToolLayout tool={tool} instructions="Paste HTML or text with special characters to encode them as safe HTML entities.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Input</label>
          <Textarea placeholder='<div class="test">Hello & World</div>' className="min-h-[200px] font-mono text-sm resize-y" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">HTML Encoded Output</label>
          <Textarea readOnly value={output} className="min-h-[200px] font-mono text-sm resize-y bg-muted/30" placeholder="Encoded output..." />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy Output'}</Button>
        <Button variant="outline" onClick={() => setInput('')}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
