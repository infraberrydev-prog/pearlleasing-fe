import { DEFAULT_QUERY, EMPTY_FILTER, ReportQuery, ReportSummary, queryReports } from './report';

const reports: ReportSummary[] = [
  { id: 'RP1', name: 'Report for January', amount: 100, createdAt: '2025-01-05T08:00:00.000Z', updatedAt: null },
  { id: 'RP2', name: 'Report for February', amount: 300, createdAt: '2025-02-03T08:00:00.000Z', updatedAt: '2025-02-10T08:00:00.000Z' },
  { id: 'RP3', name: 'Report for March', amount: 200, createdAt: '2025-03-04T08:00:00.000Z', updatedAt: null },
];

const run = (query: Partial<ReportQuery>) => queryReports(reports, { ...DEFAULT_QUERY, ...query });
const ids = (query: Partial<ReportQuery>) => run(query).items.map((r) => r.id);

describe('queryReports', () => {
  it('defaults to newest first and reports totals', () => {
    expect(ids({})).toEqual(['RP3', 'RP2', 'RP1']);
    expect(run({}).grandTotal).toBe(3);
  });

  it('searches names and IDs, case-insensitively', () => {
    expect(ids({ search: 'febr' })).toEqual(['RP2']);
    expect(ids({ search: 'rp3' })).toEqual(['RP3']);
    expect(run({ search: 'nothing' })).toMatchObject({ total: 0, grandTotal: 3 });
  });

  it('sorts by amount', () => {
    expect(ids({ sort: 'amount-desc' })).toEqual(['RP2', 'RP3', 'RP1']);
    expect(ids({ sort: 'amount-asc' })).toEqual(['RP1', 'RP3', 'RP2']);
  });

  it('filters by amount range, created range and update status', () => {
    expect(ids({ filter: { ...EMPTY_FILTER, amountMin: 150, amountMax: 250 } })).toEqual(['RP3']);
    expect(
      ids({ filter: { ...EMPTY_FILTER, createdFrom: '2025-02-01T00:00:00.000Z', createdTo: '2025-02-28T00:00:00.000Z' } }),
    ).toEqual(['RP2']);
    expect(ids({ filter: { ...EMPTY_FILTER, updated: 'updated' } })).toEqual(['RP2']);
    expect(ids({ filter: { ...EMPTY_FILTER, updated: 'not-updated' } })).toEqual(['RP3', 'RP1']);
  });

  it('pages the results', () => {
    expect(ids({ pageSize: 2, page: 2 })).toEqual(['RP1']);
    expect(run({ pageSize: 2, page: 2 }).total).toBe(3);
  });
});
