import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const safeCurrency = (typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency)) ? currency : 'EUR';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export function formatCompactCurrency(amount: number, currency: string = 'EUR'): string {
  const safeCurrency = (typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency)) ? currency : 'EUR';
  const symbol = safeCurrency === 'EUR' ? '€' : safeCurrency === 'USD' ? '$' : `${safeCurrency} `;
  const val = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    const formatted = (abs / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 });
    return `${sign}${symbol}${formatted}M`;
  }
  if (abs >= 1_000) {
    const formatted = (abs / 1_000).toLocaleString('en-US', { maximumFractionDigits: 0 });
    return `${sign}${symbol}${formatted}k`;
  }
  return `${sign}${symbol}${abs.toLocaleString('en-US')}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num / 100)
}

export function formatDate(date?: string | Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date?: string | Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
