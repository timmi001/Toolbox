import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENCY_OPTIONS, getPreferredCurrency, setPreferredCurrency, formatCurrency, type CurrencyCode } from '@/lib/currency';

interface CurrencyPreferenceContextValue {
  currencyCode: CurrencyCode;
  setCurrencyCode: (currencyCode: string) => void;
  formatCurrency: (value: number) => string;
}

const CurrencyPreferenceContext = createContext<CurrencyPreferenceContextValue | undefined>(undefined);

export function CurrencyPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>(() => getPreferredCurrency());

  useEffect(() => {
    setCurrencyCodeState(getPreferredCurrency());
  }, []);

  const setCurrencyCode = (value: string) => {
    const normalized = value.toUpperCase();
    if (CURRENCY_OPTIONS.some((currency) => currency.code === normalized)) {
      setCurrencyCodeState(normalized as CurrencyCode);
      setPreferredCurrency(normalized);
    }
  };

  const formatCurrencyValue = useMemo(
    () => (value: number) => formatCurrency(value, currencyCode),
    [currencyCode],
  );

  return (
    <CurrencyPreferenceContext.Provider value={{ currencyCode, setCurrencyCode, formatCurrency: formatCurrencyValue }}>
      {children}
    </CurrencyPreferenceContext.Provider>
  );
}

export function useCurrencyPreference() {
  const context = useContext(CurrencyPreferenceContext);
  if (!context) {
    throw new Error('useCurrencyPreference must be used within a CurrencyPreferenceProvider');
  }
  return context;
}
