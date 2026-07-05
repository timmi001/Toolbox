import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function AddPageNumbers() {
  const tool = getToolBySlug('add-page-numbers')!;
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function addNumbers() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((page, i) => {
        const { width } = page.getSize();
        page.drawText(`${i + 1} / ${pages.length}`, {
          x: width / 2 - 20,
          y: 20,
          size: 12,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'numbered_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to add page numbers to the footer of every page.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🔢</div>
        <div className="font-medium">{file ? file.name : 'Click to upload PDF'}</div>
      </div>
      <div className="text-sm text-muted-foreground mb-4">Page numbers will be added to the center-bottom of each page (format: "1 / 10").</div>
      <Button onClick={addNumbers} disabled={!file || loading} className="w-full">
        {loading ? 'Adding Page Numbers...' : 'Add Page Numbers & Download'}
      </Button>
    </ToolLayout>
  );
}
