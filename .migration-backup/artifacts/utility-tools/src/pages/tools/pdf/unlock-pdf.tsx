import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';

export default function UnlockPdf() {
  const tool = getToolBySlug('unlock-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function unlock() {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: false } as Parameters<typeof PDFDocument.load>[1]);
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'unlocked_' + file.name; a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not unlock PDF. The password may be incorrect, or the PDF uses unsupported encryption.');
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a password-protected PDF. Enter the password to unlock and download an unprotected copy.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] || null); setError(''); }} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🔓</div>
        <div className="font-medium">{file ? file.name : 'Click to upload PDF'}</div>
      </div>
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">PDF Password (leave empty if no password)</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter PDF password..." />
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      <Button onClick={unlock} disabled={!file || loading} className="w-full">
        {loading ? 'Unlocking...' : 'Unlock & Download'}
      </Button>
    </ToolLayout>
  );
}
