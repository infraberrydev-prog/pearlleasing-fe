/** One row of a report list (Leasing or Expenses). */
export interface ReportSummary {
  /** e.g. "RP25234" (leasing) or "EP25234" (expenses). */
  id: string;
  name: string;
  /** Expected Revenue (leasing) or Total Expenses (expenses), in pesos. */
  amount: number;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string | null;
}

export type ReportSort =
  | 'amount-desc'
  | 'amount-asc'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'updated-asc';

export type UpdatedFilter = 'all' | 'updated' | 'not-updated';

export interface ReportFilter {
  /** ISO dates (start of day, end of day inclusive). */
  createdFrom: string | null;
  createdTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
  updated: UpdatedFilter;
}

export interface ReportQuery {
  search: string;
  sort: ReportSort | null;
  filter: ReportFilter;
  /** 1-based. */
  page: number;
  pageSize: number;
}

export interface ReportPage {
  items: ReportSummary[];
  /** Matches across all pages. */
  total: number;
  /** Reports that exist at all, ignoring search and filters (tells "empty" from "no results"). */
  grandTotal: number;
}

export const EMPTY_FILTER: ReportFilter = {
  createdFrom: null,
  createdTo: null,
  amountMin: null,
  amountMax: null,
  updated: 'all',
};

export const DEFAULT_QUERY: ReportQuery = {
  search: '',
  sort: null,
  filter: EMPTY_FILTER,
  page: 1,
  // Figma shows eight rows per page.
  pageSize: 8,
};

export function isFilterActive(filter: ReportFilter): boolean {
  return (
    filter.createdFrom !== null ||
    filter.createdTo !== null ||
    filter.amountMin !== null ||
    filter.amountMax !== null ||
    filter.updated !== 'all'
  );
}

/** Labels that differ between Leasing and Expenses. */
export interface ReportListConfig {
  /** "Expected Revenue" / "Total Expenses". */
  amountLabel: string;
  /** Empty state title, e.g. "No available reports yet." */
  emptyTitle: string;
  /** Accessible name for the table, e.g. "Leasing reports". */
  caption: string;
  /** Shows the Delete action on each report. Default true. */
  canDelete?: boolean;
}

/**
 * Applies search, filters, sort and paging the way the list expects.
 * Used by the mock APIs; a real backend does this server-side.
 */
export function queryReports(all: readonly ReportSummary[], query: ReportQuery): ReportPage {
  const search = query.search.trim().toLowerCase();
  const { createdFrom, createdTo, amountMin, amountMax, updated } = query.filter;
  const from = createdFrom ? new Date(createdFrom).getTime() : -Infinity;
  const to = createdTo ? new Date(createdTo).getTime() + 86_400_000 - 1 : Infinity;

  const matches = all.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search) && !r.id.toLowerCase().includes(search)) {
      return false;
    }
    const created = new Date(r.createdAt).getTime();
    if (created < from || created > to) return false;
    if (amountMin !== null && r.amount < amountMin) return false;
    if (amountMax !== null && r.amount > amountMax) return false;
    if (updated === 'updated' && !r.updatedAt) return false;
    if (updated === 'not-updated' && r.updatedAt) return false;
    return true;
  });

  const time = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);
  const comparators: Record<ReportSort, (a: ReportSummary, b: ReportSummary) => number> = {
    'amount-desc': (a, b) => b.amount - a.amount,
    'amount-asc': (a, b) => a.amount - b.amount,
    'created-desc': (a, b) => time(b.createdAt) - time(a.createdAt),
    'created-asc': (a, b) => time(a.createdAt) - time(b.createdAt),
    'updated-desc': (a, b) => time(b.updatedAt) - time(a.updatedAt),
    'updated-asc': (a, b) => time(a.updatedAt) - time(b.updatedAt),
  };
  const sorted = [...matches].sort(comparators[query.sort ?? 'created-desc']);
  const start = (query.page - 1) * query.pageSize;

  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    grandTotal: all.length,
  };
}
