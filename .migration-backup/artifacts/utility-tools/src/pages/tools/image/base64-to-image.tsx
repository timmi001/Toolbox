import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function Base64ToImage() {
  const tool = getToolBySlug('base64-to-image')!;
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  function generate() {
    const src = input.trim().startsWith('data:') ? input.trim() : `data:image/png;base64,${input.trim()}`;
    const img = new Image();
    img.onload = () => { setPreview(src); setError(''); };
    img.onerror = () => setError('Invalid Base64 image data');
    img.src = src;
  }

  function download() {
    const a = document.createElement('a');
    a.href = preview;
    a.download = 'image.png';
    a.click();
  }

  return (
    <ToolLayout tool={tool} instructions="Paste a Base64 data URL or raw Base64 string to preview and download the image.">
      <Textarea placeholder="data:image/png;base64,..." className="min-h-[120px] font-mono text-xs mb-4" value={input} onChange={(e) => setInput(e.target.value)} />
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      {preview && (
        <div className="mb-4 text-center">
          <img src={preview} className="max-h-64 mx-auto rounded-lg border border-border/50 object-contain" alt="Preview" />
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={generate} disabled={!input}>Generate Preview</Button>
        {preview && <Button variant="outline" onClick={download}>Download Image</Button>}
        <Button variant="outline" onClick={() => { setInput(''); setPreview(''); setError(''); }}>Reset</Button>
      </div>
    </ToolLayout>
  );
}
