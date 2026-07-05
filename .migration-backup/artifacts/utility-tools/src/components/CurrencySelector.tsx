import { CURRENCY_OPTIONS } from '@/lib/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

export function CurrencySelector({ className }: { className?: string }) {
  const { currencyCode, setCurrencyCode } = useCurrencyPreference();

  return (
    <div className={className}>
      <label className="text-sm text-muted-foreground mb-1 block">Display Currency</label>
      <select
        value={currencyCode}
        onChange={(event) => setCurrencyCode(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        {CURRENCY_OPTIONS.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} — {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
}
