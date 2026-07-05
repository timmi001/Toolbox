import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Base64Encode() {
  const tool = getToolBySlug('base64-encode')!;
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = input ? btoa(unescape(encodeURIComponent(input))) : '';

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Type or paste text to instantly encode it to Base64.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Plain Text Input</label>
          <Textarea placeholder="Enter text to encode..." className="min-h-[200px] font-mono text-sm resize-y" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Base64 Output</label>
          <Textarea readOnly value={output} className="min-h-[200px] font-mono text-sm resize-y bg-muted/30" placeholder="Base64 will appear here..." />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy Output'}</Button>
        <Button variant="outline" onClick={() => setInput('')}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
