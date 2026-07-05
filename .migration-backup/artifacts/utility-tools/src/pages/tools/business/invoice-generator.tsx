import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileText } from 'lucide-react';

export default function InvoiceGenerator() {
  const tool = getToolBySlug('invoice-generator')!;
  const [company, setCompany] = useState('Northstar Studio');
  const [client, setClient] = useState('Ava Daniels');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [date, setDate] = useState('2026-07-02');
  const [service, setService] = useState('Web Design');
  const [amount, setAmount] = useState('1200');
  const [tax, setTax] = useState('96');
  const [notes, setNotes] = useState('Payment due within 14 days.');

  const total = useMemo(() => {
    const subtotal = Number(amount || 0);
    const taxAmount = Number(tax || 0);
    return (subtotal + taxAmount).toFixed(2);
  }, [amount, tax]);

  const download = () => {
    const content = [
      `${company}`,
      `Invoice #${invoiceNumber}`,
      `Date: ${date}`,
      '',
      `Bill To: ${client}`,
      `Service: ${service}`,
      `Amount: $${amount}`,
      `Tax: $${tax}`,
      `Total: $${total}`,
      '',
      notes,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${invoiceNumber || 'invoice'}.txt`;
    link.click();
  };

  return (
    <ToolLayout tool={tool} instructions="Fill in the invoice details, then download a ready-to-share invoice draft.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Your company</label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Client name</label><Input value={client} onChange={(e) => setClient(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Invoice number</label><Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Invoice date</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Service / item</label><Input value={service} onChange={(e) => setService(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Amount</label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Tax</label><Input type="number" value={tax} onChange={(e) => setTax(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} /></div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="w-4 h-4" /> Preview
        </div>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{company}</p>
          <p>Invoice #{invoiceNumber}</p>
          <p>Date: {date}</p>
          <p>Bill To: {client}</p>
          <p>Service: {service}</p>
          <p>Subtotal: ${amount}</p>
          <p>Tax: ${tax}</p>
          <p className="font-semibold text-foreground">Total: ${total}</p>
          <p>{notes}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={download} className="gap-2">
          <Download className="w-4 h-4" /> Download Invoice Draft
        </Button>
      </div>
    </ToolLayout>
  );
}
