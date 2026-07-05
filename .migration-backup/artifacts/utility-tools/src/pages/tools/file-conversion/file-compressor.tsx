import ConversionToolShell from '@/pages/tools/file-conversion/ConversionToolShell';

export default function FileCompressor() {
  return (
    <ConversionToolShell
      slug="file-compressor"
      acceptedTypes="*/*"
      outputLabel="Compression Notes"
      outputExtension=".txt"
      mimeType="text/plain"
      description="Upload a file and generate a simple compression-ready output summary."
    />
  );
}
