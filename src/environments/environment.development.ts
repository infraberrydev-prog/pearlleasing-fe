import { Environment } from './environment.model';

/** Development settings for `ng serve`. `/api` is forwarded to the backend by proxy.conf.json (update its target when the Codespace URL changes). */
export const environment: Environment = {
  production: false,
  apiBaseUrl: '/api',
  // true runs the app on in-memory sample data, without the backend.
  useMocks: false,
};
