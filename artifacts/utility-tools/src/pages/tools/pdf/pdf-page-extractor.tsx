import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';

export default function PdfPageExtractor() {
  const tool = getToolBySlug('pdf-page-extractor')!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState('1');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
  }

  function parsePages(input: string, total: number): number[] {
    const result = new Set<number>();
    input.split(',').forEach(p => {
      const [s, e] = p.trim().split('-').map(n => parseInt(n) - 1);
      if (!isNaN(s)) {
        if (!isNaN(e)) for (let i = s; i <= Math.min(e, total - 1); i++) result.add(i);
        else if (s >= 0 && s < total) result.add(s);
      }
    });
    return Array.from(result).sort((a, b) => a - b);
  }

  async function extract() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const indices = parsePages(pages, srcDoc.getPageCount());
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach(p => newDoc.addPage(p));
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'extracted_pages.pdf'; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF and specify which pages to extract (e.g. 1, 3, 5-8).">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">📑</div>
        <div className="font-medium">{file ? `${file.name} (${pageCount} pages)` : 'Click to upload PDF'}</div>
      </div>
      {file && (
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Pages to extract (e.g. 1, 3, 5-8)</label>
          <Input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="1, 3, 5-8" />
        </div>
      )}
      <Button onClick={extract} disabled={!file || !pages || loading} className="w-full">
        {loading ? 'Extracting...' : 'Extract Pages & Download'}
      </Button>
    </ToolLayout>
  );
}
