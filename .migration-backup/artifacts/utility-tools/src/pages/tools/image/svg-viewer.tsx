import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#00A86B" opacity="0.8"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif">SVG</text>
</svg>`;

export default function SvgViewer() {
  const tool = getToolBySlug('svg-viewer')!;
  const [code, setCode] = useState(DEFAULT_SVG);
  const [error, setError] = useState('');

  const isValid = code.trim().startsWith('<svg') || code.trim().startsWith('<?xml');

  function download() {
    const blob = new Blob([code], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'image.svg'; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const img = new Image();
    img.onload = () => {
      canvas.getContext('2d')!.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'image.png'; a.click();
    };
    img.onerror = () => setError('Could not render SVG as PNG');
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(code)));
  }

  return (
    <ToolLayout tool={tool} instructions="Paste SVG code on the left to see a live preview. Download as SVG or PNG.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">SVG Code</label>
          <Textarea value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} className="min-h-[300px] font-mono text-xs resize-y" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Preview</label>
          <div className="min-h-[300px] border border-border/50 rounded-lg p-4 bg-white flex items-center justify-center">
            {isValid ? (
              <div dangerouslySetInnerHTML={{ __html: code }} className="max-w-full max-h-full" />
            ) : (
              <span className="text-gray-400 text-sm">Enter valid SVG code</span>
            )}
          </div>
        </div>
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={download} disabled={!isValid}>Download SVG</Button>
        <Button variant="outline" onClick={downloadPng} disabled={!isValid}>Download PNG</Button>
      </div>
    </ToolLayout>
  );
}
