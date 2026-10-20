import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

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
