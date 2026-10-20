import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Base URL for backend requests; inject it in the HTTP API classes. Tests can override it. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => environment.apiBaseUrl.replace(/\/+$/, ''),
});

/** Whether the app runs on the mock APIs (see environment.useMocks). */
export const USE_MOCK_APIS = new InjectionToken<boolean>('USE_MOCK_APIS', {
  factory: () => environment.useMocks,
});
