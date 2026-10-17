/** Peso amounts are typed as text ("1,500.50") and parsed on save. */
export const AMOUNT_PATTERN = /^\s*\d{1,3}(,?\d{3})*(\.\d{1,2})?\s*$/;

export function parseAmount(text: string | null | undefined): number | null {
  if (!text || text.trim() === '') return null;
  const value = Number(text.replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}
