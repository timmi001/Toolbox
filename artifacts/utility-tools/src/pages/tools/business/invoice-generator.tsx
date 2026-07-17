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
  const [clientEmail, setClientEmail] = useState('ava@acme.co');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [date, setDate] = useState('2026-07-02');
  const [dueDate, setDueDate] = useState('2026-07-16');
  const [service, setService] = useState('Web Design');
  const [amount, setAmount] = useState('1200');
  const [tax, setTax] = useState('96');
  const [notes, setNotes] = useState('Payment due within 14 days.');

  const subtotal = Number(amount || 0);
  const taxAmount = Number(tax || 0);
  const total = useMemo(() => (subtotal + taxAmount).toFixed(2), [subtotal, taxAmount]);

  const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

  const formatDisplayDate = (value: string) => {
    if (!value) return '—';
    const parsed = new Date(`${value}T00:00:00`);
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const download = () => {
    const invoiceHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${invoiceNumber || 'Invoice'}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f5f7fb; color: #111827; padding: 32px; }
      .card { max-width: 850px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
      .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
      .title { font-size: 28px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #111827; }
      .muted { color: #6b7280; font-size: 13px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
      .box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th, td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
      th { background: #f9fafb; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
      .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
      .totals table { max-width: 320px; }
      .note { margin-top: 24px; color: #374151; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div>
          <div class="title">Invoice</div>
          <div class="muted">${company}</div>
        </div>
        <div style="text-align: right;">
          <div class="muted">Invoice #${invoiceNumber}</div>
          <div class="muted">Issued ${formatDisplayDate(date)}</div>
          <div class="muted">Due ${formatDisplayDate(dueDate)}</div>
        </div>
      </div>
      <div class="grid">
        <div class="box">
          <div class="muted" style="margin-bottom: 8px;">Bill From</div>
          <div style="font-weight: 700;">${company}</div>
          <div class="muted">Professional services and consulting</div>
        </div>
        <div class="box">
          <div class="muted" style="margin-bottom: 8px;">Bill To</div>
          <div style="font-weight: 700;">${client}</div>
          <div class="muted">${clientEmail}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${service}</td>
            <td>Delivered as requested for the current project engagement.</td>
            <td>${formatCurrency(amount)}</td>
          </tr>
        </tbody>
      </table>
      <div class="totals">
        <table>
          <tr><td>Subtotal</td><td>${formatCurrency(amount)}</td></tr>
          <tr><td>Tax</td><td>${formatCurrency(tax)}</td></tr>
          <tr><td style="font-weight: 700;">Total</td><td style="font-weight: 700;">${formatCurrency(total)}</td></tr>
        </table>
      </div>
      <div class="note"><strong>Note:</strong> ${notes}</div>
    </div>
  </body>
</html>`;

    const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${invoiceNumber || 'invoice'}.html`;
    link.click();
  };

  return (
    <ToolLayout tool={tool} instructions="Fill in the invoice details, then download a polished invoice draft.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Your company</label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Client name</label><Input value={client} onChange={(e) => setClient(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Client email</label><Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Invoice number</label><Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
        </div>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Invoice date</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Due date</label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Service / item</label><Input value={service} onChange={(e) => setService(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Amount</label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Tax</label><Input type="number" value={tax} onChange={(e) => setTax(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} /></div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="w-4 h-4" /> Invoice Preview
        </div>
        <div className="mt-4 rounded-2xl border border-border/60 bg-slate-50 p-6 text-sm text-slate-700">
          <div className="flex flex-col gap-4 border-b border-border/60 pb-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Invoice</p>
              <p className="text-xl font-semibold text-foreground">{company}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-semibold text-foreground">#{invoiceNumber}</p>
              <p>Issued {formatDisplayDate(date)}</p>
              <p>Due {formatDisplayDate(dueDate)}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Bill From</p>
              <p className="mt-2 font-semibold text-foreground">{company}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Bill To</p>
              <p className="mt-2 font-semibold text-foreground">{client}</p>
              <p className="text-muted-foreground">{clientEmail}</p>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-border/60">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Item</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Description</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3">{service}</td>
                  <td className="px-4 py-3 text-muted-foreground">Delivered as requested for the current project engagement.</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 rounded-xl border border-border/60 bg-background p-4">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(amount)}</span></div>
              <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold text-foreground"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{notes}</p>
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
