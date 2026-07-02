import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';

export default function DeletePdfPages() {
  const tool = getToolBySlug('delete-pdf-pages')!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesToDelete, setPagesToDelete] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
  }

  function parsePages(input: string, total: number): number[] {
    const pages = new Set<number>();
    input.split(',').forEach(part => {
      const [start, end] = part.trim().split('-').map(n => parseInt(n) - 1);
      if (!isNaN(start)) {
        if (!isNaN(end)) for (let i = start; i <= Math.min(end, total - 1); i++) pages.add(i);
        else if (start >= 0 && start < total) pages.add(start);
      }
    });
    return Array.from(pages).sort((a, b) => b - a);
  }

  async function deletePages() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const toDelete = parsePages(pagesToDelete, doc.getPageCount());
      toDelete.forEach(i => doc.removePage(i));
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'pages_deleted_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF, specify pages to delete (e.g. 1,3,5-7), then download.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🗑️</div>
        <div className="font-medium">{file ? `${file.name} (${pageCount} pages)` : 'Click to upload PDF'}</div>
      </div>
      {file && (
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Pages to delete (e.g. 1, 3, 5-7)</label>
          <Input value={pagesToDelete} onChange={(e) => setPagesToDelete(e.target.value)} placeholder="1, 3, 5-7" />
          <p className="text-xs text-muted-foreground mt-1">PDF has {pageCount} pages. Use commas and dashes.</p>
        </div>
      )}
      <Button onClick={deletePages} disabled={!file || !pagesToDelete || loading} className="w-full">
        {loading ? 'Processing...' : 'Delete Pages & Download'}
      </Button>
    </ToolLayout>
  );
}
