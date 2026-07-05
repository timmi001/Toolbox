import ConversionToolShell from '@/pages/tools/file-conversion/ConversionToolShell';

export default function EpubToPdf() {
  return (
    <ConversionToolShell
      slug="epub-to-pdf"
      acceptedTypes=".epub,application/epub+zip"
      outputLabel="PDF Prep"
      outputExtension=".txt"
      mimeType="text/plain"
      description="Upload an EPUB document and prepare a PDF-ready conversion summary."
    />
  );
}
