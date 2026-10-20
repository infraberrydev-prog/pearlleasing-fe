/** Build-time settings. Everything here ships in the browser bundle, so never put secrets in it. */
export interface Environment {
  production: boolean;
  /** Prefix for every backend request, without a trailing slash. */
  apiBaseUrl: string;
  /** Use the in-memory mock APIs instead of calling the backend. */
  useMocks: boolean;
}
