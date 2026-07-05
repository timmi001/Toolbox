import ConversionToolShell from '@/pages/tools/file-conversion/ConversionToolShell';

export default function CsvToJson() {
  return (
    <ConversionToolShell
      slug="csv-to-json"
      acceptedTypes=".csv,text/csv"
      outputLabel="JSON"
      outputExtension=".json"
      mimeType="application/json"
      kind="csv-to-json"
      description="Upload a CSV file and download it as JSON with each row converted into an object."
    />
  );
}
