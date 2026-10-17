import { Injectable } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';
import { ReportPage, ReportQuery, ReportSummary, queryReports } from '../../reports/models/report';

/** Backend contract for leasing reports. Only the mock exists until the API is known. */
export abstract class LeasingApi {
  abstract list(query: ReportQuery): Observable<ReportPage>;
  abstract delete(id: string): Observable<void>;
  /** CSV of the given reports, or of every report when `ids` is empty. */
  abstract export(ids: readonly string[]): Observable<Blob>;
}

const LATENCY_MS = 400;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Two years of monthly reports ("encoded the first week of each month", per the Figma sticky note). */
function seed(): ReportSummary[] {
  return Array.from({ length: 22 }, (_, i) => {
    const month = i % 12;
    const year = 2024 + Math.floor(i / 12);
    const created = new Date(year, month, 1 + (i % 7), 8, 30, 22);
    const updated = i % 3 === 0 ? new Date(year, month, 15, 14, 5, 0) : null;
    return {
      id: `RP${25200 + i}`,
      name: `Report for Month of ${MONTHS[month]}${year === 2024 ? ' 2024' : ''}`,
      amount: 2500 + ((i * 7919) % 98000),
      createdAt: created.toISOString(),
      updatedAt: updated?.toISOString() ?? null,
    };
  });
}

@Injectable()
export class MockLeasingApi extends LeasingApi {
  private reports = seed();

  list(query: ReportQuery): Observable<ReportPage> {
    return defer(() => of(queryReports(this.reports, query))).pipe(delay(LATENCY_MS));
  }

  delete(id: string): Observable<void> {
    return defer(() => {
      this.reports = this.reports.filter((r) => r.id !== id);
      return of(undefined);
    }).pipe(delay(LATENCY_MS));
  }

  export(ids: readonly string[]): Observable<Blob> {
    return defer(() => {
      const rows = ids.length ? this.reports.filter((r) => ids.includes(r.id)) : this.reports;
      const csv = [
        'Report ID,Report Name,Expected Revenue,Date & Time Created,Last Updated',
        ...rows.map((r) => [r.id, `"${r.name}"`, r.amount.toFixed(2), r.createdAt, r.updatedAt ?? ''].join(',')),
      ].join('\n');
      return of(new Blob([csv], { type: 'text/csv' }));
    }).pipe(delay(LATENCY_MS));
  }
}
