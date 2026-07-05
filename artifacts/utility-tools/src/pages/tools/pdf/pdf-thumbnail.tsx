import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function PdfThumbnail() {
  const tool = getToolBySlug('pdf-thumbnail')!;
  const [thumbnail, setThumbnail] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true); setThumbnail('');
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
      const buf = await file.arrayBuffer();
      const pdf = await getDocument({ data: buf }).promise;
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, canvas, viewport: vp }).promise;
      setThumbnail(canvas.toDataURL('image/png'));
    } finally { setLoading(false); }
  }

  function download() {
    const a = document.createElement('a');
    a.href = thumbnail; a.download = 'pdf_thumbnail.png'; a.click();
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to generate a thumbnail image of its first page.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="font-medium">{loading ? 'Generating thumbnail...' : 'Click to upload PDF'}</div>
      </div>
      {thumbnail && (
        <div className="text-center">
          <img src={thumbnail} className="max-h-80 mx-auto rounded-xl border border-border/50 shadow-lg mb-4 object-contain" alt="PDF Thumbnail" />
          <Button onClick={download}>Download Thumbnail PNG</Button>
        </div>
      )}
    </ToolLayout>
  );
}
