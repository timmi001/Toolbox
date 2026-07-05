import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Base64Decode() {
  const tool = getToolBySlug('base64-decode')!;
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  let output = '';
  try {
    if (input.trim()) {
      output = decodeURIComponent(escape(atob(input.trim())));
      if (error) setError('');
    }
  } catch {
    // handled below
  }

  function handleChange(v: string) {
    setInput(v);
    setError('');
    try {
      if (v.trim()) decodeURIComponent(escape(atob(v.trim())));
    } catch {
      setError('Invalid Base64 string');
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Paste Base64-encoded text to decode it back to plain text.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Base64 Input</label>
          <Textarea placeholder="SGVsbG8gV29ybGQ=" className="min-h-[200px] font-mono text-sm resize-y" value={input} onChange={(e) => handleChange(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Decoded Output</label>
          <Textarea readOnly value={error ? '' : output} className="min-h-[200px] font-mono text-sm resize-y bg-muted/30" placeholder="Decoded text will appear here..." />
        </div>
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={copy} disabled={!output || !!error}>{copied ? 'Copied!' : 'Copy Output'}</Button>
        <Button variant="outline" onClick={() => { setInput(''); setError(''); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
