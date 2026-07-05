import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { PDFDocument } from 'pdf-lib';

export default function PdfPageCounter() {
  const tool = getToolBySlug('pdf-page-counter')!;
  const [info, setInfo] = useState<{ count: number; pages: { w: number; h: number }[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = doc.getPages().map(p => {
      const { width, height } = p.getSize();
      return { w: Math.round(width), h: Math.round(height) };
    });
    setInfo({ count: pages.length, pages });
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to count its pages and view dimensions of each page.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">#️⃣</div>
        <div className="font-medium">Click to upload PDF</div>
      </div>
      {info && (
        <div>
          <div className="text-center mb-6">
            <div className="text-6xl font-extrabold text-primary">{info.count}</div>
            <div className="text-muted-foreground">Total Pages</div>
          </div>
          <div className="max-h-64 overflow-auto space-y-1">
            {info.pages.map((p, i) => (
              <div key={i} className="flex justify-between p-2 bg-muted/20 rounded border border-border/30 text-sm">
                <span className="text-muted-foreground">Page {i + 1}</span>
                <span className="font-mono">{p.w} × {p.h} pt ({p.w > p.h ? 'Landscape' : 'Portrait'})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
