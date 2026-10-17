import { MANILA_TIME_ZONE, formatReportDate } from '../../../shared/pipes/format.pipes';
import { ReportSummary } from './report';

/** Quotes a cell when it contains a comma, quote or line break (RFC 4180). */
function cell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * CSV for the "Download Report" export, shared by Leasing and Expenses.
 * - Dates read like the list ("Jan 1, 2026 - 08:30:22"), always in Philippine time, so the file
 *   says the same thing wherever it's opened. No Last Updated → "—".
 * - The amount column stays a plain number ("8500.00") so Excel can sum it.
 * - Starts with a UTF-8 byte order mark so Excel shows "—" correctly; rows end in CRLF.
 */
export function buildReportCsv(reports: readonly ReportSummary[], amountLabel: string): string {
  const header = ['Report ID', 'Report Name', amountLabel, 'Date & Time Created', 'Last Updated'];
  const rows = reports.map((r) => [
    r.id,
    r.name,
    r.amount.toFixed(2),
    formatReportDate(r.createdAt, MANILA_TIME_ZONE),
    formatReportDate(r.updatedAt, MANILA_TIME_ZONE),
  ]);
  return '﻿' + [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
}
