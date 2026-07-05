import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export default function SplitPdf() {
  const tool = getToolBySlug('split-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
  }

  async function split() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const zip = new JSZip();
      for (let i = 0; i < srcDoc.getPageCount(); i++) {
        const newDoc = await PDFDocument.create();
        const [page] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(page);
        const pdfBytes = await newDoc.save();
        zip.file(`page_${i + 1}.pdf`, pdfBytes);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url; a.download = 'split_pages.zip'; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to split it into individual pages. All pages will be downloaded as a ZIP.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6">
        <div className="text-4xl mb-2">✂️</div>
        <div className="font-medium">{file ? `${file.name} — ${pageCount} pages` : 'Click to upload PDF'}</div>
      </div>
      {file && <div className="text-sm text-muted-foreground mb-4">Will create {pageCount} individual PDF files, zipped together.</div>}
      <Button onClick={split} disabled={!file || loading} className="w-full">
        {loading ? 'Splitting...' : 'Split into Pages & Download ZIP'}
      </Button>
    </ToolLayout>
  );
}
