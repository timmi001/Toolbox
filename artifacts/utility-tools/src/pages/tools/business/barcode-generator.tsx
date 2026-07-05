import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function BarcodeGenerator() {
  const tool = getToolBySlug('barcode-generator')!;
  const [code, setCode] = useState('SKU-2401');

  const bars = useMemo(() => {
    const normalized = code.replace(/\s+/g, '').toUpperCase();
    const values = normalized.split('').map(char => char.charCodeAt(0) % 7);
    return values.map((value, index) => ({
      id: `${index}-${value}`,
      width: 2 + value,
      height: 70 + (index % 3) * 6,
    }));
  }, [code]);

  const download = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="140" viewBox="0 0 320 140"><rect width="100%" height="100%" fill="white"/><text x="16" y="118" font-family="Arial" font-size="18">${code}</text>${bars.map((bar) => `<rect x="${16 + bars.slice(0, bars.indexOf(bar)).reduce((sum, item) => sum + item.width + 1, 0)}" y="14" width="${bar.width}" height="${bar.height}" fill="black"/>`).join('')}</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'barcode.svg';
    link.click();
  };

  return (
    <ToolLayout tool={tool} instructions="Enter a product code or SKU to generate a simple barcode-style SVG.">
      <div className="flex flex-wrap gap-3">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter SKU or code" className="max-w-md" />
        <Button onClick={download} className="gap-2">
          <Download className="w-4 h-4" /> Download SVG
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-white p-6 inline-block">
        <svg width="320" height="140" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="140" fill="white" />
          <text x="16" y="118" fontFamily="Arial" fontSize="18">{code}</text>
          {bars.map((bar, index) => {
            const x = 16 + bars.slice(0, index).reduce((sum, item) => sum + item.width + 1, 0);
            return <rect key={bar.id} x={x} y="14" width={bar.width} height={bar.height} fill="black" />;
          })}
        </svg>
      </div>
    </ToolLayout>
  );
}
