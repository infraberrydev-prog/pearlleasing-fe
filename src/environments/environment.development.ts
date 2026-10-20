import { Environment } from './environment.model';

/** Development settings for `ng serve`. `/api` is forwarded to the backend by proxy.conf.json (update its target when the Codespace URL changes). */
export const environment: Environment = {
  production: false,
  apiBaseUrl: '/api',
  // Auth uses the real API; leasing and expenses stay on mocks until they are integrated.
  useMocks: false,
};
