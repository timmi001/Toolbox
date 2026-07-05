import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';

export default function RearrangePdfPages() {
  const tool = getToolBySlug('rearrange-pdf-pages')!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const n = doc.getPageCount();
    setPageCount(n);
    setOrder(Array.from({ length: n }, (_, i) => i));
  }

  function move(from: number, to: number) {
    const newOrder = [...order];
    const [item] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, item);
    setOrder(newOrder);
  }

  async function save() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, order);
      pages.forEach(p => newDoc.addPage(p));
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'rearranged_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF and reorder pages using the up/down buttons. Then download.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">↕️</div>
        <div className="font-medium">{file ? `${file.name} (${pageCount} pages)` : 'Click to upload PDF'}</div>
      </div>
      {order.length > 0 && (
        <div className="space-y-2 mb-4 max-h-64 overflow-auto">
          {order.map((originalIdx, position) => (
            <div key={originalIdx} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-muted-foreground text-sm w-8 text-center">{position + 1}</span>
              <span className="flex-1 text-sm">Original Page {originalIdx + 1}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => position > 0 && move(position, position - 1)} disabled={position === 0} className="h-7 w-7 p-0">↑</Button>
                <Button variant="ghost" size="sm" onClick={() => position < order.length - 1 && move(position, position + 1)} disabled={position === order.length - 1} className="h-7 w-7 p-0">↓</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button onClick={save} disabled={!file || loading} className="w-full">
        {loading ? 'Saving...' : 'Save Reordered PDF'}
      </Button>
    </ToolLayout>
  );
}
