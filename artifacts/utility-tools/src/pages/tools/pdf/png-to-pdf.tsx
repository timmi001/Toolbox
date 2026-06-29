import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';

export default function PngToPdf() {
  const tool = getToolBySlug('png-to-pdf')!;
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function convert() {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const doc = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const img = await doc.embedPng(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'images.pdf'; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload PNG images to combine them into a single PDF file.">
      <input ref={inputRef} type="file" accept="image/png" multiple className="hidden" onChange={(e) => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="font-medium">Click to add PNG images</div>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {files.map((f, i) => (
            <div key={i} className="text-xs bg-muted/30 border border-border/30 rounded px-2 py-1 flex items-center gap-1">
              {f.name} <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive ml-1">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={convert} disabled={files.length === 0 || loading} className="flex-1">
          {loading ? 'Converting...' : `Convert ${files.length} PNG(s) to PDF`}
        </Button>
        <Button variant="outline" onClick={() => setFiles([])}>Clear</Button>
      </div>
    </ToolLayout>
  );
}
