import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export default function WatermarkPdf() {
  const tool = getToolBySlug('watermark-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function watermark() {
    if (!file || !text) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      doc.getPages().forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width / 2 - (text.length * 18) / 2,
          y: height / 2,
          size: 48,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity / 100,
          rotate: degrees(45),
        });
      });
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'watermarked_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF, enter watermark text, and adjust opacity.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">💧</div>
        <div className="font-medium">{file ? file.name : 'Click to upload PDF'}</div>
      </div>
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Watermark Text</label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIDENTIAL" />
        </div>
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Opacity</span><span>{opacity}%</span>
          </div>
          <Slider min={10} max={100} value={[opacity]} onValueChange={([v]) => setOpacity(v)} />
        </div>
      </div>
      <Button onClick={watermark} disabled={!file || !text || loading} className="w-full">
        {loading ? 'Adding Watermark...' : 'Add Watermark & Download'}
      </Button>
    </ToolLayout>
  );
}
