/**
 * Format a number as USD currency.
 */
export function formatCurrency(n: number): string {
  const x = Number.isFinite(n) ? n : 0;
  return x.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

/**
 * Format a number as a compact currency string (no decimals).
 */
export function formatCurrencyCompact(n: number): string {
  const x = Number.isFinite(n) ? n : 0;
  return x.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number as a percentage.
 */
export function formatPercent(n: number): string {
  const x = Number.isFinite(n) ? n : 0;
  return `${(x * 100).toFixed(1)}%`;
}
