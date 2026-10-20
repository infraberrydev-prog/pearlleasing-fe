import { Injectable } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import { DownloadedFile } from '../../../shared/utils/api';
import { ReportPage, ReportQuery, ReportSummary, queryReports } from '../../reports/models/report';
import { mockStartsEmpty } from '../../reports/models/mock-options';
import { buildReportCsv } from '../../reports/models/report-csv';
import { ExpenseReportDetail, ExpenseReportDraft, expenseTotal } from '../models/expense-report';

/** Backend contract for expenses reports. `Mock*` is the in-memory version used by tests and `useMocks`. */
export abstract class ExpensesApi {
  abstract list(query: ReportQuery): Observable<ReportPage>;
  abstract get(id: string): Observable<ExpenseReportDetail>;
  abstract create(draft: ExpenseReportDraft): Observable<ExpenseReportDetail>;
  abstract update(id: string, draft: ExpenseReportDraft): Observable<ExpenseReportDetail>;
  abstract delete(id: string): Observable<void>;
  /** Files for the given reports, or for every report when `ids` is empty. */
  abstract export(ids: readonly string[]): Observable<DownloadedFile[]>;
}

const LATENCY_MS = 400;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Monthly expenses reports, "Expenses for May" style (Figma 561:23611). */
function seed(): ExpenseReportDetail[] {
  return Array.from({ length: 14 }, (_, i) => {
    const month = i % 12;
    const year = 2025 + Math.floor(i / 12);
    const created = new Date(year, month, 1, 8, 30, 22);
    const updated = i % 4 === 0 ? new Date(year, month, 20, 10, 15, 0) : null;
    return {
      id: `EP${25200 + i}`,
      name: `Expenses for ${MONTHS[month]}${i >= 12 ? ` ${year}` : ''}`,
      expenses: {
        electricity: 1500 + (i % 5) * 250,
        payroll: 4000 + (i % 3) * 1000,
        water: 500 + (i % 4) * 100,
        maintenance: 1000 + (i % 6) * 300,
      },
      createdAt: created.toISOString(),
      updatedAt: updated?.toISOString() ?? null,
    };
  });
}

const summarize = (report: ExpenseReportDetail): ReportSummary => ({
  id: report.id,
  name: report.name,
  amount: expenseTotal(report.expenses),
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
});

const clone = <T>(value: T): T => structuredClone(value);

@Injectable()
export class MockExpensesApi extends ExpensesApi {
  private reports = mockStartsEmpty() ? [] : seed();
  private nextId = 25200 + this.reports.length;

  list(query: ReportQuery): Observable<ReportPage> {
    return defer(() => of(queryReports(this.reports.map(summarize), query))).pipe(delay(LATENCY_MS));
  }

  get(id: string): Observable<ExpenseReportDetail> {
    return defer(() => {
      const report = this.reports.find((r) => r.id === id);
      return report ? of(clone(report)) : throwError(() => new Error(`Report ${id} was not found.`));
    }).pipe(delay(LATENCY_MS));
  }

  create(draft: ExpenseReportDraft): Observable<ExpenseReportDetail> {
    return defer(() => {
      const report: ExpenseReportDetail = {
        ...clone(draft),
        id: `EP${this.nextId++}`,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };
      this.reports = [report, ...this.reports];
      return of(clone(report));
    }).pipe(delay(LATENCY_MS));
  }

  update(id: string, draft: ExpenseReportDraft): Observable<ExpenseReportDetail> {
    return defer(() => {
      const existing = this.reports.find((r) => r.id === id);
      if (!existing) return throwError(() => new Error(`Report ${id} was not found.`));
      const report = { ...existing, ...clone(draft), updatedAt: new Date().toISOString() };
      this.reports = this.reports.map((r) => (r.id === id ? report : r));
      return of(clone(report));
    }).pipe(delay(LATENCY_MS));
  }

  delete(id: string): Observable<void> {
    return defer(() => {
      this.reports = this.reports.filter((r) => r.id !== id);
      return of(undefined);
    }).pipe(delay(LATENCY_MS));
  }

  export(ids: readonly string[]): Observable<DownloadedFile[]> {
    return defer(() => {
      const rows = (ids.length ? this.reports.filter((r) => ids.includes(r.id)) : this.reports).map(summarize);
      const csv = buildReportCsv(rows, 'Total Expenses');
      return of([{ blob: new Blob([csv], { type: 'text/csv;charset=utf-8' }), fileName: 'expenses-reports.csv' }]);
    }).pipe(delay(LATENCY_MS));
  }
}
