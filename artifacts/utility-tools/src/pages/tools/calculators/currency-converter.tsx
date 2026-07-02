import { useEffect, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { CurrencySelector } from '@/components/CurrencySelector';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.53,
  CHF: 0.89, CNY: 7.24, INR: 83.5, BRL: 4.95, MXN: 17.2, KRW: 1325,
  SGD: 1.34, HKD: 7.82, NOK: 10.6, SEK: 10.4, DKK: 6.89, NZD: 1.62,
  ZAR: 18.6, RUB: 91.5, TRY: 30.8, SAR: 3.75, AED: 3.67, PLN: 3.98,
};

export default function CurrencyConverter() {
  const tool = getToolBySlug('currency-converter')!;
  const { currencyCode, setCurrencyCode } = useCurrencyPreference();
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState(currencyCode);
  const [amount, setAmount] = useState('100');

  useEffect(() => {
    setTo(currencyCode);
  }, [currencyCode]);

  const result = parseFloat(amount) * (RATES[to] / RATES[from]);
  const currencies = Object.keys(RATES);

  const handleToChange = (value: string) => {
    setTo(value);
    setCurrencyCode(value);
  };

  return (
    <ToolLayout tool={tool} instructions="Enter amount and select currencies to convert. Rates are static approximations for reference only.">
      <CurrencySelector className="mb-6" />
      <div className="grid md:grid-cols-3 gap-4 mb-6 items-end">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Amount</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">To</label>
          <select value={to} onChange={(e) => handleToChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {!isNaN(result) && (
        <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl mb-4">
          <div className="text-sm text-muted-foreground mb-1">{parseFloat(amount).toLocaleString()} {from} =</div>
          <div className="text-4xl font-extrabold text-primary">{result.toFixed(2)} {to}</div>
          <div className="text-sm text-muted-foreground mt-2">Rate: 1 {from} = {(RATES[to] / RATES[from]).toFixed(4)} {to}</div>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center">⚠️ Rates are approximate. For live rates, use a financial service.</p>
    </ToolLayout>
  );
}
