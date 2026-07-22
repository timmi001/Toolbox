import { Download, FileDown, Import, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HistoryToolbarProps {
  onImportClick: () => void;
  onExportJson: () => void;
  onExportTxt: () => void;
  onExportPdf: () => void;
  onClear: () => void;
}

export function HistoryToolbar({ onImportClick, onExportJson, onExportTxt, onExportPdf, onClear }: HistoryToolbarProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
      <Button variant="outline" onClick={onImportClick} className="gap-2">
        <Import className="h-4 w-4" />
        Import
      </Button>
      <Button variant="outline" onClick={onExportJson} className="gap-2">
        <FileDown className="h-4 w-4" />
        JSON
      </Button>
      <Button variant="outline" onClick={onExportTxt} className="gap-2">
        <Download className="h-4 w-4" />
        TXT
      </Button>
      <Button variant="outline" onClick={onExportPdf} className="gap-2">
        <Download className="h-4 w-4" />
        PDF
      </Button>
      <Button variant="destructive" onClick={onClear} className="gap-2 md:ml-auto">
        <Trash2 className="h-4 w-4" />
        Clear all
      </Button>
    </div>
  );
}
