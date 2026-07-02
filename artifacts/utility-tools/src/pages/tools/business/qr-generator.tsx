import { useEffect, useRef, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

export default function QrGenerator() {
  const tool = getToolBySlug('qr-generator')!;
  const [text, setText] = useState('https://example.com');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, text, { width: 256, margin: 2, color: { dark: '#111827', light: '#ffffff' } }).catch(() => {});
  }, [text]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'qr-generator.png';
    link.click();
  };

  return (
    <ToolLayout tool={tool} instructions="Paste a URL or short text to generate a QR code for sharing or printing.">
      <div className="flex flex-wrap gap-3">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL" className="max-w-xl" />
        <Button onClick={download} className="gap-2">
          <Download className="w-4 h-4" /> Download PNG
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-white p-6 inline-block">
        <canvas ref={canvasRef} />
      </div>
    </ToolLayout>
  );
}
