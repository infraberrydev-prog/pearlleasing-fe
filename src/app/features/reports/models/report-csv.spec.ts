import { firstValueFrom } from 'rxjs';
import { MockExpensesApi } from '../../expenses/data/expenses-api';
import { MockLeasingApi } from '../../leasing/data/leasing-api';
import { buildReportCsv } from './report-csv';
import { ReportSummary } from './report';

const BOM = '﻿';

const REPORTS: ReportSummary[] = [
  // 00:30:22 UTC = 08:30:22 in Manila (UTC+8).
  { id: 'RP1', name: 'Report for Month of January', amount: 8500, createdAt: '2026-01-01T00:30:22.000Z', updatedAt: null },
  // 18:05 UTC on Jan 14 is already Jan 15 in Manila.
  { id: 'RP2', name: 'Stall "A", Annex', amount: 1234.5, createdAt: '2026-01-14T18:05:00.000Z', updatedAt: '2026-01-14T18:05:00.000Z' },
];

describe('buildReportCsv', () => {
  it('formats dates in Manila time like the list, keeps amounts numeric and quotes as needed', () => {
    const csv = buildReportCsv(REPORTS, 'Expected Revenue');
    expect(csv.startsWith(BOM)).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual([
      'Report ID,Report Name,Expected Revenue,Date & Time Created,Last Updated',
      'RP1,Report for Month of January,8500.00,"Jan 1, 2026 - 08:30:22",—',
      'RP2,"Stall ""A"", Annex",1234.50,"Jan 15, 2026 - 02:05:00","Jan 15, 2026 - 02:05:00"',
    ]);
  });

  it('uses the given amount column name', () => {
    expect(buildReportCsv([], 'Total Expenses')).toBe(
      BOM + 'Report ID,Report Name,Total Expenses,Date & Time Created,Last Updated',
    );
  });
});

describe('mock API exports', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function exported(api: MockLeasingApi | MockExpensesApi, ids: string[]) {
    const blob = firstValueFrom(api.export(ids));
    await vi.advanceTimersByTimeAsync(400);
    return (await blob).text();
  }

  // The sample data is created in the machine's local time, so these check the shape only;
  // the exact Manila conversion is covered by the fixed-UTC tests above.
  const DATE = '"[A-Z][a-z]{2} \\d{1,2}, \\d{4} - \\d{2}:\\d{2}:\\d{2}"';

  it('Leasing: Expected Revenue as a number, list-style dates, "—" when never updated', async () => {
    const lines = (await exported(new MockLeasingApi(), ['RP25200', 'RP25201'])).replace(BOM, '').split('\r\n');
    expect(lines[0]).toBe('Report ID,Report Name,Expected Revenue,Date & Time Created,Last Updated');
    // RP25200 has been updated; RP25201 never was.
    expect(lines[1]).toMatch(new RegExp(`^RP25200,Report for Month of January 2024,\\d+\\.\\d{2},${DATE},${DATE}$`));
    expect(lines[2]).toMatch(new RegExp(`^RP25201,.*,\\d+\\.\\d{2},${DATE},—$`));
  });

  it('Expenses: Total Expenses column', async () => {
    const lines = (await exported(new MockExpensesApi(), ['EP25200'])).replace(BOM, '').split('\r\n');
    expect(lines[0]).toBe('Report ID,Report Name,Total Expenses,Date & Time Created,Last Updated');
    expect(lines[1]).toMatch(new RegExp(`^EP25200,Expenses for January,\\d+\\.\\d{2},${DATE},`));
  });
});
