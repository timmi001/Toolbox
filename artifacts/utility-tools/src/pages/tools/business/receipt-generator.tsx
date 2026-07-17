import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Receipt } from 'lucide-react';

export default function ReceiptGenerator() {
  const tool = getToolBySlug('receipt-generator')!;
  const [store, setStore] = useState('Northstar Studio');
  const [customer, setCustomer] = useState('Ava Daniels');
  const [receiptNumber, setReceiptNumber] = useState('RCP-2026-018');
  const [date, setDate] = useState('2026-07-02');
  const [item, setItem] = useState('Design Sprint');
  const [amount, setAmount] = useState('180');
  const [payment, setPayment] = useState('Card');
  const [notes, setNotes] = useState('Thanks for your business!');

  const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

  const formatDisplayDate = (value: string) => {
    if (!value) return '—';
    const parsed = new Date(`${value}T00:00:00`);
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const download = () => {
    const receiptHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${receiptNumber || 'Receipt'}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f5f7fb; color: #0f172a; padding: 32px; }
      .card { max-width: 760px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 18px; padding: 32px; box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
      .title { font-size: 26px; font-weight: 700; text-transform: uppercase; }
      .muted { color: #64748b; font-size: 13px; }
      .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .row { display: flex; justify-content: space-between; margin-top: 16px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
      .amount { font-size: 24px; font-weight: 700; color: #0f172a; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div>
          <div class="pill">Paid</div>
          <div class="title">Receipt</div>
          <div class="muted">${store}</div>
        </div>
        <div style="text-align: right;">
          <div class="muted">Receipt #${receiptNumber}</div>
          <div class="muted">Date ${formatDisplayDate(date)}</div>
        </div>
      </div>
      <div class="row">
        <div>
          <div class="muted">Paid to</div>
          <div style="font-weight: 700;">${store}</div>
        </div>
        <div>
          <div class="muted">Paid by</div>
          <div style="font-weight: 700;">${customer}</div>
        </div>
      </div>
      <div class="row">
        <div>
          <div class="muted">Item</div>
          <div style="font-weight: 700;">${item}</div>
        </div>
        <div>
          <div class="muted">Payment method</div>
          <div style="font-weight: 700;">${payment}</div>
        </div>
      </div>
      <div class="row">
        <div class="muted">Thank you for your purchase</div>
        <div class="amount">${formatCurrency(amount)}</div>
      </div>
      <div style="margin-top: 16px; color: #334155;">${notes}</div>
    </div>
  </body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${receiptNumber || 'receipt'}.html`;
    link.click();
  };

  return (
    <ToolLayout tool={tool} instructions="Add your store and customer details, then export a polished receipt draft.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Store / business name</label><Input value={store} onChange={(e) => setStore(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Customer</label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Receipt number</label><Input value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Receipt date</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Item / service</label><Input value={item} onChange={(e) => setItem(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Amount</label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Payment method</label><Input value={payment} onChange={(e) => setPayment(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} /></div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Receipt className="w-4 h-4" /> Receipt Preview
        </div>
        <div className="mt-4 rounded-2xl border border-border/60 bg-slate-50 p-6 text-sm text-slate-700">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-700">Paid</p>
              <p className="mt-2 text-xl font-semibold text-foreground">Receipt</p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-semibold text-foreground">#{receiptNumber}</p>
              <p>{formatDisplayDate(date)}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Paid To</p>
              <p className="mt-2 font-semibold text-foreground">{store}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Paid By</p>
              <p className="mt-2 font-semibold text-foreground">{customer}</p>
              <p className="text-muted-foreground">{payment}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border/60 bg-background p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Item</p>
              <p className="mt-1 font-semibold text-foreground">{item}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Amount</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(amount)}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{notes}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={download} className="gap-2">
          <Download className="w-4 h-4" /> Download Receipt
        </Button>
      </div>
    </ToolLayout>
  );
}
