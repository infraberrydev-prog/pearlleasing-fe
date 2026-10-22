import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

/** A file the user downloads, e.g. a report export. */
export interface DownloadedFile {
  blob: Blob;
  fileName: string;
}

/**
 * Turns a failed request into an Error with a message the UI can show. The backend sends
 * `{ message }` for most errors and plain text for some (e.g. 404 "Report with ID 9 does not exist.").
 */
export function apiError(error: unknown): Error {
  if (!(error instanceof HttpErrorResponse)) return error instanceof Error ? error : new Error('Something went wrong.');
  const body = error.error as unknown;
  if (typeof body === 'string' && body.trim()) return new Error(body.trim());
  if (body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string') {
    return new Error((body as { message: string }).message);
  }
  if (error.status === 0) return new Error('Cannot reach the server. Check your connection and try again.');
  return new Error('Something went wrong. Please try again.');
}

/**
 * The backend sends timestamps without a time zone (e.g. "2026-10-18T14:29:13.61"); they are UTC.
 * Returns an ISO string the date pipes can convert to Manila time.
 */
export function utcIso(value: string): string;
export function utcIso(value: string | null): string | null;
export function utcIso(value: string | null): string | null {
  if (!value) return null;
  return /([zZ]|[+-]\d\d:?\d\d)$/.test(value) ? value : `${value}Z`;
}

/** Reads the file name from Content-Disposition (prefers the UTF-8 `filename*`). */
export function fileNameFrom(response: HttpResponse<Blob>, fallback: string): string {
  const header = response.headers.get('Content-Disposition') ?? '';
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded) return decodeURIComponent(encoded[1].trim());
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : fallback;
}

/** The `{ data, totalPages }` envelope the report list endpoints return. */
export interface PagedResponse<T> {
  data: T[];
  totalPages: number;
}

/** Largest page the list endpoints serve (they cap larger requests at 100). */
const MAX_PAGE_SIZE = 100;

/**
 * Loads every page of a list endpoint and joins the results. The lists are queried locally,
 * so they need all rows; requests run in parallel after the first page tells how many there are.
 */
export function getAllPages<T>(http: HttpClient, url: string): Observable<T[]> {
  const page = (n: number) => http.get<PagedResponse<T>>(url, { params: { page: n, pageSize: MAX_PAGE_SIZE } });
  return page(1).pipe(
    switchMap((first) =>
      first.totalPages > 1
        ? forkJoin(Array.from({ length: first.totalPages - 1 }, (_, i) => page(i + 2))).pipe(
            map((rest) => [first, ...rest].flatMap((p) => p.data)),
          )
        : of(first.data),
    ),
  );
}

/** POST `{ reportIds }` to a download endpoint; the server answers with one zip of Excel files. */
export function downloadReports(http: HttpClient, url: string, reportIds: number[], fallbackName: string): Observable<DownloadedFile[]> {
  return http
    .post(url, { reportIds }, { observe: 'response', responseType: 'blob' })
    .pipe(map((response) => [{ blob: response.body!, fileName: fileNameFrom(response, fallbackName) }]));
}

/** "RP00004" / "EP00004" → 4. The API's formatted ids are the numeric id with a prefix. */
export function numericId(id: string): number {
  const digits = /\d+/.exec(id);
  if (!digits) throw new Error(`Invalid report ID "${id}".`);
  return Number(digits[0]);
}
