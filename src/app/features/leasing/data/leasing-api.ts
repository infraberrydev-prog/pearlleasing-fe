import { Injectable } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import { ReportPage, ReportQuery, ReportSummary, queryReports } from '../../reports/models/report';
import { mockStartsEmpty } from '../../reports/models/mock-options';
import { buildReportCsv } from '../../reports/models/report-csv';
import {
  LeaseRow,
  LeasingLookups,
  LeasingReportDetail,
  LeasingReportDraft,
  reportTotal,
} from '../models/leasing-report';

/** Backend contract for leasing reports. Only the mock exists until the API is known. */
export abstract class LeasingApi {
  abstract list(query: ReportQuery): Observable<ReportPage>;
  abstract get(id: string): Observable<LeasingReportDetail>;
  abstract create(draft: LeasingReportDraft): Observable<LeasingReportDetail>;
  abstract update(id: string, draft: LeasingReportDraft): Observable<LeasingReportDetail>;
  abstract delete(id: string): Observable<void>;
  /** CSV of the given reports, or of every report when `ids` is empty. */
  abstract export(ids: readonly string[]): Observable<Blob>;
  abstract lookups(): Observable<LeasingLookups>;
}

const LATENCY_MS = 400;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Sample choices; "Pearl Plaza / J&C Supplies / John Martial" come from the Figma rows.
const LOOKUPS: LeasingLookups = {
  buildingTypes: ['Pearl Plaza', 'Pearl Place Annex', 'Pearl Arcade', 'Pearl Commercial Center'],
  vendors: ['J&C Supplies', 'Food Stall', 'Dry Goods', 'Electronics', 'Pharmacy', 'Services'],
  stalls: ['A-01', 'A-02', 'A-03', 'B-01', 'B-02', 'C-01', 'C-02'],
  paymentMethods: ['Cash', 'Bank Transfer', 'GCash', 'Check'],
};
const LESSEES = ['John Martial', 'Maria Santos', 'Jose Reyes', 'Ana Cruz', 'Carlo Dizon'];

function sampleRow(seed: number): LeaseRow {
  const pick = <T>(list: T[], offset = 0) => list[(seed + offset) % list.length];
  return {
    buildingType: pick(LOOKUPS.buildingTypes),
    vendor: pick(LOOKUPS.vendors, 1),
    stall: pick(LOOKUPS.stalls, 2),
    lesseeName: pick(LESSEES, 3),
    mobileNumber: seed % 2 ? '0917 123 4567' : null,
    tin: null,
    monthlyRental: 2500 + (seed % 9) * 1500,
    paymentStatus: seed % 3 === 0 ? 'unpaid' : 'paid',
    paymentMethod: pick(LOOKUPS.paymentMethods),
    referenceNumber: `REF-${10000 + seed * 37}`,
    electricity: 500 + (seed % 5) * 100,
    water: 200 + (seed % 4) * 50,
    otherUtilities: 100,
    cusaFee: seed % 2 ? 300 : null,
    pylonRental: null,
    penalty: seed % 4 === 0 ? 250 : null,
  };
}

/** Two years of monthly reports ("encoded the first week of each month", per the Figma sticky note). */
function seed(): LeasingReportDetail[] {
  return Array.from({ length: 22 }, (_, i) => {
    const month = i % 12;
    const year = 2024 + Math.floor(i / 12);
    const created = new Date(year, month, 1 + (i % 7), 8, 30, 22);
    const updated = i % 3 === 0 ? new Date(year, month, 15, 14, 5, 0) : null;
    return {
      id: `RP${25200 + i}`,
      name: `Report for Month of ${MONTHS[month]}${year === 2024 ? ' 2024' : ''}`,
      // A few large reports so the detail page has several pages of rows.
      rows: Array.from({ length: i % 5 === 1 ? 23 : 1 + (i % 4) }, (_, r) => sampleRow(i * 5 + r)),
      createdAt: created.toISOString(),
      updatedAt: updated?.toISOString() ?? null,
    };
  });
}

const summarize = (report: LeasingReportDetail): ReportSummary => ({
  id: report.id,
  name: report.name,
  amount: reportTotal(report.rows),
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
});

const clone = <T>(value: T): T => structuredClone(value);

@Injectable()
export class MockLeasingApi extends LeasingApi {
  private reports = mockStartsEmpty() ? [] : seed();
  private nextId = 25200 + this.reports.length;

  list(query: ReportQuery): Observable<ReportPage> {
    return defer(() => of(queryReports(this.reports.map(summarize), query))).pipe(delay(LATENCY_MS));
  }

  get(id: string): Observable<LeasingReportDetail> {
    return defer(() => {
      const report = this.reports.find((r) => r.id === id);
      return report ? of(clone(report)) : throwError(() => new Error(`Report ${id} was not found.`));
    }).pipe(delay(LATENCY_MS));
  }

  create(draft: LeasingReportDraft): Observable<LeasingReportDetail> {
    return defer(() => {
      const report: LeasingReportDetail = {
        ...clone(draft),
        id: `RP${this.nextId++}`,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };
      this.reports = [report, ...this.reports];
      return of(clone(report));
    }).pipe(delay(LATENCY_MS));
  }

  update(id: string, draft: LeasingReportDraft): Observable<LeasingReportDetail> {
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

  export(ids: readonly string[]): Observable<Blob> {
    return defer(() => {
      const rows = (ids.length ? this.reports.filter((r) => ids.includes(r.id)) : this.reports).map(summarize);
      const csv = buildReportCsv(rows, 'Expected Revenue');
      return of(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    }).pipe(delay(LATENCY_MS));
  }

  lookups(): Observable<LeasingLookups> {
    return of(clone(LOOKUPS));
  }
}
