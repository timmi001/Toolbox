export const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['code'];

const STORAGE_KEY = 'preferred-currency';

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  AT: 'EUR',
  GR: 'EUR',
  FI: 'EUR',
  LU: 'EUR',
  SI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  JP: 'JPY',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  CH: 'CHF',
  CN: 'CNY',
  IN: 'INR',
  BR: 'BRL',
  MX: 'MXN',
  KR: 'KRW',
  SG: 'SGD',
  HK: 'HKD',
  NO: 'NOK',
  SE: 'SEK',
  DK: 'DKK',
  ZA: 'ZAR',
  RU: 'RUB',
  TR: 'TRY',
  SA: 'SAR',
  AE: 'AED',
  PL: 'PLN',
};

const isCurrencyCode = (value: string | null | undefined): value is CurrencyCode => {
  if (!value) return false;
  return CURRENCY_OPTIONS.some((currency) => currency.code === value);
};

export const getPreferredCurrency = (): CurrencyCode => {
  if (typeof window === 'undefined') return 'USD';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (isCurrencyCode(saved)) return saved;

  const browserCurrency = Intl.NumberFormat().resolvedOptions().currency;
  if (isCurrencyCode(browserCurrency)) return browserCurrency;

  const locale = navigator.language || 'en-US';
  const region = locale.split('-')[1]?.toUpperCase();
  if (region && COUNTRY_TO_CURRENCY[region]) return COUNTRY_TO_CURRENCY[region];

  return 'USD';
};

export const setPreferredCurrency = (currencyCode: string) => {
  if (typeof window === 'undefined') return;
  const normalized = currencyCode.toUpperCase();
  if (isCurrencyCode(normalized)) {
    window.localStorage.setItem(STORAGE_KEY, normalized);
  }
};

export const formatCurrency = (value: number, currencyCode: CurrencyCode = 'USD') => {
  const safeCurrency = isCurrencyCode(currencyCode) ? currencyCode : 'USD';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: safeCurrency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  }).format(value);
};

export const getCurrencyLabel = (currencyCode: CurrencyCode = 'USD') => {
  const currency = CURRENCY_OPTIONS.find((item) => item.code === currencyCode);
  return currency ? `${currency.code} — ${currency.name}` : currencyCode;
};
