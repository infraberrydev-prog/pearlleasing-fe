import { Pipe, PipeTransform } from '@angular/core';

const PESO = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Philippine time, for exports that must read the same wherever they're opened. */
export const MANILA_TIME_ZONE = 'Asia/Manila';

// One date and one time formatter per time zone (undefined = the browser's own zone).
const formatters = new Map<string | undefined, { date: Intl.DateTimeFormat; time: Intl.DateTimeFormat }>();
function formattersFor(timeZone?: string) {
  let pair = formatters.get(timeZone);
  if (!pair) {
    pair = {
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone }),
      time: new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZone,
      }),
    };
    formatters.set(timeZone, pair);
  }
  return pair;
}

/** 100500 → "₱ 100,500.00" (Figma table and cards). */
export function formatPeso(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `₱ ${PESO.format(value)}`;
}

/**
 * ISO date → "Jan 8, 2025 - 08:30:22"; empty → "—" (Figma "Last Updated").
 * Uses the browser's time zone unless `timeZone` is given (e.g. `MANILA_TIME_ZONE`).
 */
export function formatReportDate(value: string | Date | null | undefined, timeZone?: string): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  const { date: dateFormat, time: timeFormat } = formattersFor(timeZone);
  return `${dateFormat.format(date)} - ${timeFormat.format(date)}`;
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
