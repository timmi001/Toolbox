import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function PdfToJpg() {
  const tool = getToolBySlug('pdf-to-jpg')!;
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setPreviews([]);
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d')!, canvas, viewport }).promise;
        pages.push(canvas.toDataURL('image/jpeg', 0.9));
      }
      setPreviews(pages);
    } finally { setLoading(false); }
  }

  function download(url: string, i: number) {
    const a = document.createElement('a');
    a.href = url; a.download = `page_${i + 1}.jpg`; a.click();
  }

  function downloadAll() {
    previews.forEach((url, i) => { setTimeout(() => download(url, i), i * 200); });
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to render each page as a JPG image. Download individually or all at once.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">📄</div>
        <div className="font-medium">{loading ? 'Rendering pages...' : 'Click to upload PDF'}</div>
      </div>
      {previews.length > 0 && (
        <div>
          <Button onClick={downloadAll} className="w-full mb-4">Download All JPGs ({previews.length} pages)</Button>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((url, i) => (
              <div key={i} className="text-center">
                <img src={url} className="w-full rounded-lg border border-border/50 mb-2 cursor-pointer" onClick={() => download(url, i)} alt={`Page ${i + 1}`} />
                <Button variant="outline" size="sm" onClick={() => download(url, i)} className="w-full">Download Page {i + 1}</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
