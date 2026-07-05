import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument, degrees } from 'pdf-lib';

export default function RotatePdf() {
  const tool = getToolBySlug('rotate-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function rotate() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      doc.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + angle) % 360)));
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'rotated_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF, choose rotation angle, and download the rotated file.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🔄</div>
        <div className="font-medium">{file ? file.name : 'Click to upload PDF'}</div>
      </div>
      <div className="flex gap-2 mb-6 justify-center">
        {[90, 180, 270].map(a => (
          <Button key={a} variant={angle === a ? 'default' : 'outline'} onClick={() => setAngle(a)} className="flex-1">Rotate {a}°</Button>
        ))}
      </div>
      <Button onClick={rotate} disabled={!file || loading} className="w-full">
        {loading ? 'Rotating...' : `Rotate All Pages ${angle}° & Download`}
      </Button>
    </ToolLayout>
  );
}
