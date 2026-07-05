import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ImageToBase64() {
  const tool = getToolBySlug('image-to-base64')!;
  const [result, setResult] = useState('');
  const [size, setSize] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setResult(url);
      setSize(file.size);
    };
    reader.readAsDataURL(file);
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatSize(b: number) { return b < 1024 ? b + ' B' : (b / 1024).toFixed(1) + ' KB'; }

  return (
    <ToolLayout tool={tool} instructions="Upload any image to get its Base64 data URL for embedding in HTML/CSS.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="font-medium">Click to upload image</div>
      </div>
      {result && (
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Base64 Data URL ({formatSize(result.length)})</span>
            <span>Original: {formatSize(size)}</span>
          </div>
          <Textarea readOnly value={result} className="min-h-[120px] font-mono text-xs mb-4 bg-muted/30" />
          <div className="flex gap-2">
            <Button onClick={copy}>{copied ? 'Copied!' : 'Copy Data URL'}</Button>
            <Button variant="outline" onClick={() => { setResult(''); setSize(0); }}>Reset</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
