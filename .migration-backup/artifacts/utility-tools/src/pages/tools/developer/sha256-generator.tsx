import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Sha256Generator() {
  const tool = getToolBySlug('sha256-generator')!;
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (input) {
      sha256(input).then(setHash);
    } else {
      setHash('');
    }
  }, [input]);

  function copy() {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Type or paste text to compute its SHA-256 hash using the Web Crypto API.">
      <Textarea placeholder="Enter text to hash..." className="min-h-[120px] mb-4 font-mono text-sm resize-y" value={input} onChange={(e) => setInput(e.target.value)} />
      {hash && (
        <div className="mb-4 p-4 bg-muted/30 border border-border/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">SHA-256 Hash</div>
          <div className="font-mono text-sm text-primary break-all select-all">{hash}</div>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={copy} disabled={!hash}>{copied ? 'Copied!' : 'Copy Hash'}</Button>
        <Button variant="outline" onClick={() => setInput('')}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
