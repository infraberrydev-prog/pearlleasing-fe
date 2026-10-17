import { Pipe, PipeTransform } from '@angular/core';

const PESO = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** 100500 → "₱ 100,500.00" (Figma table and cards). */
export function formatPeso(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `₱ ${PESO.format(value)}`;
}

/** ISO date → "Jan 8, 2025 - 08:30:22"; empty → "—" (Figma "Last Updated"). */
export function formatReportDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${DATE.format(date)} - ${TIME.format(date)}`;
}

@Pipe({ name: 'peso' })
export class PesoPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatPeso(value);
  }
}

@Pipe({ name: 'reportDate' })
export class ReportDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    return formatReportDate(value);
  }
}
