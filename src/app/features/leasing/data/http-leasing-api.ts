import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concat, forkJoin, last, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/config';
import { DownloadedFile, apiError, fileNameFrom, utcIso } from '../../../shared/utils/api';
import { ReportPage, ReportQuery, ReportSummary, queryReports } from '../../reports/models/report';
import { LeaseRow, LeasingLookups, LeasingReportDetail, LeasingReportDraft, reportTotal } from '../models/leasing-report';
import { LeasingApi } from './leasing-api';

// ---- Backend shapes (GET /api/reports/..., /api/master-data/...) ----

interface ReportListDto {
  id: number;
  reportId: string;
  reportName: string;
  expectedCashRevenue: number;
  dateTimeCreated: string;
  lastDateUpdated: string | null;
}

interface ReportRowDto {
  id: number;
  buildingType: string;
  vendorNameOrCategory: string;
  stallUnit: string;
  lesseeName: string;
  mobileNo: string | null;
  tinNo: string | null;
  monthlyRental: number;
  paymentStatus: string;
  paymentMethod: string;
  referenceNo: string;
  electricity: number;
  water: number;
  otherUtilities: number;
  cusaFee: number | null;
  pylonRental: number | null;
  penaltyTenPercent: number | null;
}

interface ReportDetailsDto {
  reportId: string;
  reportName: string;
  totalRevenue: number;
  dateCreated: string;
  rowData: ReportRowDto[];
}

interface Named {
  id: number;
  name: string;
}

interface StallDto {
  id: number;
  unitNumber: string;
}

/** Buildings with their stalls, used to turn the typed names into the ids the API needs. */
interface Directory {
  buildings: (Named & { stalls: StallDto[] })[];
  lookups: LeasingLookups;
}

/** The API has no payment-method list; these match the values it already stores (e.g. "Gcash"). */
const PAYMENT_METHODS = ['Cash', 'Gcash', 'Bank Transfer', 'Check'];

/** The API pages but has no search, sort or filter, so the list loads every report and queries locally. */
const ALL = { page: 1, pageSize: 1000 };
/** The details endpoint still names its page parameter `pageNumber`. */
const ALL_ROWS = { pageNumber: 1, pageSize: 1000 };

/** "RP00004" → 4. The API's formatted ids are the numeric id with a prefix. */
export function numericId(id: string): number {
  const digits = /\d+/.exec(id);
  if (!digits) throw new Error(`Invalid report ID "${id}".`);
  return Number(digits[0]);
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const title = (status: string) => (status === 'paid' ? 'Paid' : 'Unpaid');

function toRow(dto: ReportRowDto): LeaseRow {
  return {
    id: dto.id,
    buildingType: dto.buildingType,
    vendor: dto.vendorNameOrCategory,
    stall: dto.stallUnit,
    lesseeName: dto.lesseeName,
    mobileNumber: dto.mobileNo || null,
    tin: dto.tinNo || null,
    monthlyRental: dto.monthlyRental,
    paymentStatus: dto.paymentStatus.toLowerCase() === 'paid' ? 'paid' : 'unpaid',
    paymentMethod: dto.paymentMethod,
    referenceNumber: dto.referenceNo,
    electricity: dto.electricity,
    water: dto.water,
    otherUtilities: dto.otherUtilities,
    cusaFee: dto.cusaFee,
    pylonRental: dto.pylonRental,
    penalty: dto.penaltyTenPercent || null,
  };
}

/** Real leasing reports backend (`/api/reports`). */
@Injectable()
export class HttpLeasingApi extends LeasingApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private directory$: Observable<Directory> | null = null;
  private summaries$: Observable<ReportSummary[]> | null = null;

  /** Fetches the reports once; searching, sorting, filtering and paging then run on that copy. */
  list(query: ReportQuery, refresh = false): Observable<ReportPage> {
    if (refresh) this.summaries$ = null;
    return this.summaries().pipe(map((all) => queryReports(all, query)));
  }

  get(id: string): Observable<LeasingReportDetail> {
    return this.http
      .get<ReportDetailsDto>(`${this.base}/reports/${numericId(id)}/details`, { params: { ...ALL_ROWS } })
      .pipe(
        map((dto) => ({
          id: dto.reportId,
          name: dto.reportName,
          rows: dto.rowData.map(toRow),
          createdAt: utcIso(dto.dateCreated),
          // Not in the details response; the list has it.
          updatedAt: null,
        })),
        catchError((error) => throwError(() => apiError(error))),
      );
  }

  create(draft: LeasingReportDraft): Observable<LeasingReportDetail> {
    return this.loadDirectory().pipe(
      switchMap((dir) => {
        const body = [
          {
            id: 0,
            reportName: draft.name,
            createdAt: new Date().toISOString(),
            grandTotalAmount: reportTotal(draft.rows),
            reportIdFormatted: null,
            rows: draft.rows.map((row) => ({ ...this.rowBody(row, dir), tinNo: row.tin ?? '' })),
          },
        ];
        return this.http.post<{ message: string; savedIds: number[] }>(`${this.base}/reports/save-reports`, body);
      }),
      switchMap(({ savedIds }) => this.get(String(savedIds[0]))),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  /**
   * The API saves rows, not reports: changed rows go to update-report, new rows to rows/add and
   * removed rows to rows/delete. It cannot rename a report.
   */
  update(id: string, draft: LeasingReportDraft): Observable<LeasingReportDetail> {
    return forkJoin([this.get(id), this.loadDirectory()]).pipe(
      switchMap(([current, dir]) => {
        if (draft.name !== current.name) {
          return throwError(() => new Error('Renaming a report is not supported by the server yet.'));
        }
        const reportId = numericId(id);
        const kept = new Set(draft.rows.flatMap((row) => (row.id === undefined ? [] : [row.id])));
        const existing = draft.rows.filter((row) => row.id !== undefined);
        const added = draft.rows.filter((row) => row.id === undefined);
        const removed = current.rows.filter((row) => row.id !== undefined && !kept.has(row.id));

        const requests: Observable<unknown>[] = [
          ...(existing.length
            ? [this.http.post(`${this.base}/reports/update-report`, existing.map((row) => ({ ...this.rowBody(row, dir), id: row.id })))]
            : []),
          ...added.map((row) =>
            this.http.post(`${this.base}/reports/${reportId}/rows/add`, { ...this.rowBody(row, dir), tinNo: row.tin ?? '' }),
          ),
          ...removed.map((row) => this.http.post(`${this.base}/reports/rows/delete/${row.id}`, null)),
        ];
        // One after another, so a failure stops the rest instead of leaving a half-applied mix.
        return requests.length ? concat(...requests).pipe(last()) : of(null);
      }),
      switchMap(() => this.get(id)),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  /** Not offered in the UI: the API only deletes rows (see update), not whole reports. */
  delete(): Observable<void> {
    return throwError(() => new Error('Deleting whole reports is not supported by the server.'));
  }

  /** One Excel file per report (the server builds them); every report when `ids` is empty. */
  export(ids: readonly string[]): Observable<DownloadedFile[]> {
    const ids$ = ids.length ? of([...ids]) : this.summaries().pipe(map((all) => all.map((r) => r.id)));
    return ids$.pipe(
      switchMap((list) =>
        forkJoin(
          list.map((id) =>
            this.http
              .get(`${this.base}/report/${numericId(id)}/download-lease-report`, { observe: 'response', responseType: 'blob' })
              .pipe(map((response) => ({ blob: response.body!, fileName: fileNameFrom(response, `${id}.xlsx`) }))),
          ),
        ),
      ),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  lookups(): Observable<LeasingLookups> {
    return this.loadDirectory().pipe(map((dir) => dir.lookups));
  }

  private summaries(): Observable<ReportSummary[]> {
    this.summaries$ ??= this.http.get<{ data: ReportListDto[] }>(`${this.base}/reports/get-all-reports`, { params: { ...ALL } }).pipe(
      map(({ data }) =>
        data.map((dto) => ({
          id: dto.reportId,
          name: dto.reportName,
          amount: dto.expectedCashRevenue,
          createdAt: utcIso(dto.dateTimeCreated),
          updatedAt: utcIso(dto.lastDateUpdated),
        })),
      ),
      catchError((error) => {
        this.summaries$ = null;
        return throwError(() => apiError(error));
      }),
      shareReplay(1),
    );
    return this.summaries$;
  }

  /** Buildings, vendors and every building's stalls; loaded once and kept for this page visit. */
  private loadDirectory(): Observable<Directory> {
    this.directory$ ??= forkJoin([
      this.http.get<Named[]>(`${this.base}/master-data/buildings`),
      this.http.get<Named[]>(`${this.base}/master-data/vendors`),
    ]).pipe(
      switchMap(([buildings, vendors]) =>
        (buildings.length
          ? forkJoin(buildings.map((b) => this.http.get<StallDto[]>(`${this.base}/master-data/stalls/by-building/${b.id}`)))
          : of([] as StallDto[][])
        ).pipe(
          map((stalls) => ({
            buildings: buildings.map((b, i) => ({ ...b, stalls: stalls[i] })),
            lookups: {
              buildingTypes: buildings.map((b) => b.name),
              vendors: vendors.map((v) => v.name),
              stalls: [...new Set(stalls.flat().map((s) => s.unitNumber))],
              paymentMethods: PAYMENT_METHODS,
            },
          })),
        ),
      ),
      catchError((error) => {
        this.directory$ = null;
        return throwError(() => apiError(error));
      }),
      shareReplay(1),
    );
    return this.directory$;
  }

  /** The fields create, add and update share. Building and stall must match the master data. */
  private rowBody(row: LeaseRow, dir: Directory) {
    const building = dir.buildings.find((b) => sameText(b.name, row.buildingType));
    if (!building) throw new Error(`Unknown building "${row.buildingType}". Pick one from the list.`);
    // Some saved rows pair a building with another building's stall, so fall back to any building.
    const stall =
      building.stalls.find((s) => sameText(s.unitNumber, row.stall)) ??
      dir.buildings.flatMap((b) => b.stalls).find((s) => sameText(s.unitNumber, row.stall));
    if (!stall) throw new Error(`Unknown stall "${row.stall}". Pick one from the list.`);
    return {
      buildingId: building.id,
      stallUnitId: stall.id,
      building: building.name,
      buildingType: building.name,
      vendorNameOrCategory: row.vendor,
      stallUnit: stall.unitNumber,
      nameOfLessee: row.lesseeName,
      mobileNumber: row.mobileNumber,
      monthlyRental: row.monthlyRental,
      paymentStatus: title(row.paymentStatus),
      paymentMethod: row.paymentMethod,
      referenceNumber: row.referenceNumber,
      electricity: row.electricity,
      water: row.water,
      otherUtilities: row.otherUtilities,
      cusaFee: row.cusaFee,
      pylonRental: row.pylonRental,
      penaltyTenPercent: row.penalty,
    };
  }
}
