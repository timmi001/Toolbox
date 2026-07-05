import ConversionToolShell from '@/pages/tools/file-conversion/ConversionToolShell';

export default function ExcelToCsv() {
  return (
    <ConversionToolShell
      slug="excel-to-csv"
      acceptedTypes=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      outputLabel="CSV"
      outputExtension=".csv"
      mimeType="text/csv"
      description="Upload an Excel workbook or spreadsheet export and produce a CSV-ready output."
    />
  );
}
