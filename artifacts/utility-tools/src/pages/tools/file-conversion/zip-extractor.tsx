import ConversionToolShell from '@/pages/tools/file-conversion/ConversionToolShell';

export default function ZipExtractor() {
  return (
    <ConversionToolShell
      slug="zip-extractor"
      acceptedTypes=".zip,application/zip"
      outputLabel="Extraction Summary"
      outputExtension=".txt"
      mimeType="text/plain"
      description="Upload a ZIP archive and preview the file list and extraction-ready output." 
    />
  );
}
