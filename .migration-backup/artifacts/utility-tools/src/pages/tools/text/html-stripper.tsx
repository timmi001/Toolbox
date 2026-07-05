import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function HtmlStripper() {
  const tool = getToolBySlug('html-stripper')!;
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = input
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Paste HTML code in the left box. Plain text output appears on the right.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">HTML Input</label>
          <Textarea placeholder="<p>Paste your <strong>HTML</strong> here...</p>" className="min-h-[250px] font-mono text-sm resize-y" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Plain Text Output</label>
          <Textarea readOnly value={output} className="min-h-[250px] text-sm resize-y bg-muted/30" placeholder="Plain text will appear here..." />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={copy} disabled={!output}>{copied ? 'Copied!' : 'Copy Output'}</Button>
        <Button variant="outline" onClick={() => setInput('')}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
