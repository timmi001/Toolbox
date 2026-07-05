import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';

function formatSize(b: number) { return b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(2) + ' MB'; }

export default function CompressPdf() {
  const tool = getToolBySlug('compress-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ size: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function compress() {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const compressed = await doc.save({ useObjectStreams: true });
      setResult({ size: compressed.byteLength });
      const blob = new Blob([compressed as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'compressed_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to compress it using object streams optimization.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); }} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">📦</div>
        <div className="font-medium">{file ? file.name : 'Click to upload PDF'}</div>
        {file && <div className="text-sm text-muted-foreground mt-1">Original size: {formatSize(file.size)}</div>}
      </div>
      {result && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="text-green-400 font-medium">Compressed!</div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatSize(file!.size)} → {formatSize(result.size)} ({((1 - result.size / file!.size) * 100).toFixed(1)}% reduction)
          </div>
        </div>
      )}
      <Button onClick={compress} disabled={!file || loading} className="w-full">
        {loading ? 'Compressing...' : 'Compress & Download'}
      </Button>
    </ToolLayout>
  );
}
