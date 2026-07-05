import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument, degrees } from 'pdf-lib';

export default function PdfOrientation() {
  const tool = getToolBySlug('pdf-orientation')!;
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const pages = doc.getPages();
    const landscape = pages.filter(p => p.getWidth() > p.getHeight()).length;
    setInfo(`${pages.length} pages: ${landscape} landscape, ${pages.length - landscape} portrait`);
  }

  async function fixOrientation() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      doc.getPages().forEach(page => {
        if (page.getWidth() > page.getHeight()) {
          page.setRotation(degrees(90));
        }
      });
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'fixed_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to detect and fix landscape pages by rotating them to portrait.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">📐</div>
        <div className="font-medium">{file ? file.name : 'Click to upload PDF'}</div>
      </div>
      {info && <div className="mb-4 p-3 bg-muted/30 rounded-lg text-sm text-center">{info}</div>}
      <Button onClick={fixOrientation} disabled={!file || loading} className="w-full">
        {loading ? 'Fixing...' : 'Fix Landscape Pages & Download'}
      </Button>
    </ToolLayout>
  );
}
