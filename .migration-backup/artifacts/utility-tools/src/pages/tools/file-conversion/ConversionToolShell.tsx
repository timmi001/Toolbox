import { useMemo, useRef, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, Sparkles } from 'lucide-react';

interface ConversionToolShellProps {
  slug: string;
  acceptedTypes: string;
  outputLabel: string;
  outputExtension: string;
  mimeType: string;
  kind?: 'generic' | 'csv-to-json';
  description?: string;
}

function parseCsvToJson(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      row.push(value);
      if (row.some(cell => cell.length)) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value.length || row.length) {
    row.push(value);
    if (row.some(cell => cell.length)) {
      rows.push(row);
    }
  }

  if (rows.length === 0) return [];

  const [headers, ...dataRows] = rows;
  const headerNames = headers.map(h => h.trim());

  return dataRows
    .filter(rowValues => rowValues.some(value => value.trim().length))
    .map(rowValues => {
      const entry: Record<string, string> = {};
      headerNames.forEach((header, index) => {
        entry[header || `column_${index + 1}`] = rowValues[index] ?? '';
      });
      return entry;
    });
}

export default function ConversionToolShell({
  slug,
  acceptedTypes,
  outputLabel,
  outputExtension,
  mimeType,
  kind = 'generic',
  description,
}: ConversionToolShellProps) {
  const tool = getToolBySlug(slug)!;
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('Upload a file to get started.');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setDownloadUrl(null);
    setStatus('Preparing your output…');

    let outputText = '';
    if (kind === 'csv-to-json') {
      const text = await file.text();
      const json = JSON.stringify(parseCsvToJson(text), null, 2);
      outputText = json;
    } else {
      outputText = `Conversion workflow ready for ${file.name}\nOriginal size: ${file.size} bytes\nTarget format: ${outputLabel}\n\nThis starter page is wired for local conversion workflows and can be extended with additional processing libraries when needed.`;
    }

    const blob = new Blob([outputText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    setStatus(`Ready to download ${outputLabel.toLowerCase()}.`);
  };

  const downloadOutput = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${fileName.replace(/\.[^.]+$/, '') || 'converted'}${outputExtension}`;
    link.click();
  };

  const hint = useMemo(() => {
    if (kind === 'csv-to-json') {
      return 'Upload a CSV file and download a JSON version with rows converted into objects.';
    }
    return description ?? `Upload a file and generate a ready-to-download ${outputLabel.toLowerCase()} output placeholder.`;
  }, [description, kind, outputLabel]);

  return (
    <ToolLayout tool={tool} instructions={hint}>
      <div className="space-y-5">
        <div
          className="border-2 border-dashed border-border/60 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const droppedFile = event.dataTransfer.files?.[0];
            void handleFile(droppedFile);
          }}
        >
          <Upload className="mx-auto mb-4 text-muted-foreground w-10 h-10" />
          <p className="text-lg font-semibold mb-1">Drop your file here or click to upload</p>
          <p className="text-sm text-muted-foreground">{acceptedTypes}</p>
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
        </div>

        {fileName ? (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="font-medium text-foreground">{fileName}</span>
              <span>•</span>
              <span>{fileSize}</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/70 p-3 text-sm text-muted-foreground">
              {status}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleFile((inputRef.current?.files?.[0] ?? null))} className="gap-2">
                <Sparkles className="w-4 h-4" /> Generate {outputLabel}
              </Button>
              <Button variant="outline" onClick={downloadOutput} disabled={!downloadUrl} className="gap-2">
                <Download className="w-4 h-4" /> Download {outputLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </ToolLayout>
  );
}
