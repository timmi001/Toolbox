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
  const [item, setItem] = useState('Design Sprint');
  const [amount, setAmount] = useState('180');
  const [payment, setPayment] = useState('Card');
  const [notes, setNotes] = useState('Thanks for your business!');

  const download = () => {
    const content = [
      `${store}`,
      'Receipt',
      `Customer: ${customer}`,
      `Item: ${item}`,
      `Amount: $${amount}`,
      `Payment: ${payment}`,
      '',
      notes,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'receipt.txt';
    link.click();
  };

  return (
    <ToolLayout tool={tool} instructions="Add your store and customer details, then export a simple receipt draft.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Store / business name</label><Input value={store} onChange={(e) => setStore(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Customer</label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Item / service</label><Input value={item} onChange={(e) => setItem(e.target.value)} /></div>
        </div>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Amount</label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Payment method</label><Input value={payment} onChange={(e) => setPayment(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} /></div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Receipt className="w-4 h-4" /> Receipt Preview
        </div>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{store}</p>
          <p>Customer: {customer}</p>
          <p>Item: {item}</p>
          <p>Amount: ${amount}</p>
          <p>Payment: {payment}</p>
          <p>{notes}</p>
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
