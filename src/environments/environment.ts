import { Environment } from './environment.model';

/** Production settings. `ng build` uses this file; development swaps in environment.development.ts. */
export const environment: Environment = {
  production: true,
  // Same-origin by default; set the full URL (e.g. 'https://api.example.com') if the API is hosted elsewhere.
  apiBaseUrl: '/api',
  // Keep true until the HTTP API implementations replace the mocks.
  useMocks: true,
};
