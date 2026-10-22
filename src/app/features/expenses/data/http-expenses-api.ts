import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/config';
import { DownloadedFile, apiError, downloadReports, getAllPages, numericId, utcIso } from '../../../shared/utils/api';
import { ReportPage, ReportQuery, ReportSummary, queryReports } from '../../reports/models/report';
import { ExpenseReportDetail, ExpenseReportDraft } from '../models/expense-report';
import { ExpensesApi } from './expenses-api';

// ---- Backend shapes (/api/expenses-reports/...) ----

interface ExpenseListDto {
  id: number;
  reportId: string;
  reportName: string;
  totalExpenses: number;
  dateTimeCreated: string;
  lastDateUpdated: string | null;
}

interface ExpenseDetailsDto {
  reportName: string;
  electricity: number;
  payroll: number;
  water: number;
  maintenanceExpenses: number;
  totalAmount: number;
}

const toBody = (draft: ExpenseReportDraft) => ({
  reportName: draft.name,
  electricity: draft.expenses.electricity,
  payroll: draft.expenses.payroll,
  water: draft.expenses.water,
  maintenanceExpenses: draft.expenses.maintenance,
});

/** Real expenses reports backend (`/api/expenses-reports`). */
@Injectable()
export class HttpExpensesApi extends ExpensesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/expenses-reports`;
  private summaries$: Observable<ReportSummary[]> | null = null;

  /** Fetches the reports once; searching, sorting, filtering and paging then run on that copy. */
  list(query: ReportQuery, refresh = false): Observable<ReportPage> {
    if (refresh) this.summaries$ = null;
    return this.summaries().pipe(map((all) => queryReports(all, query)));
  }

  /**
   * The details response has the amounts but no dates and only the numeric id, so the dates
   * come from the list and the id stays the one that was asked for (e.g. "EP00004").
   */
  get(id: string): Observable<ExpenseReportDetail> {
    return this.http.get<ExpenseDetailsDto>(`${this.base}/${numericId(id)}/details`).pipe(
      switchMap((dto) =>
        this.summaries().pipe(
          catchError(() => of([] as ReportSummary[])),
          map((all) => {
            const summary = all.find((r) => r.id === id);
            return {
              id,
              name: dto.reportName,
              expenses: {
                electricity: dto.electricity,
                payroll: dto.payroll,
                water: dto.water,
                maintenance: dto.maintenanceExpenses,
              },
              createdAt: summary?.createdAt ?? '',
              updatedAt: summary?.updatedAt ?? null,
            };
          }),
        ),
      ),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  create(draft: ExpenseReportDraft): Observable<ExpenseReportDetail> {
    return this.http.post(`${this.base}/save-report`, toBody(draft)).pipe(
      // The list reloads when the page returns to it, so the result only needs the draft.
      map(() => ({ ...draft, id: '', createdAt: new Date().toISOString(), updatedAt: null })),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  update(id: string, draft: ExpenseReportDraft): Observable<ExpenseReportDetail> {
    return this.http.post(`${this.base}/update-report`, { id: numericId(id), ...toBody(draft) }).pipe(
      switchMap(() => {
        this.summaries$ = null;
        return this.get(id);
      }),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.post(`${this.base}/delete/${numericId(id)}`, null).pipe(
      map(() => undefined),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  /** One zip with an Excel file per report (built by the server); every report when `ids` is empty. */
  export(ids: readonly string[]): Observable<DownloadedFile[]> {
    const ids$ = ids.length ? of([...ids]) : this.summaries().pipe(map((all) => all.map((r) => r.id)));
    return ids$.pipe(
      switchMap((list) => downloadReports(this.http, `${this.base}/download`, list.map(numericId), 'expense_reports.zip')),
      catchError((error) => throwError(() => apiError(error))),
    );
  }

  private summaries(): Observable<ReportSummary[]> {
    this.summaries$ ??= getAllPages<ExpenseListDto>(this.http, `${this.base}/get-all-report`).pipe(
      map((data) =>
        data.map((dto) => ({
          id: dto.reportId,
          name: dto.reportName,
          amount: dto.totalExpenses,
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
}
