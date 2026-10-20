import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { Store, provideState } from '@ngrx/store';
import { AuthApi } from './auth-api';
import { USE_MOCK_APIS } from '../config';
import { AuthStorage } from './auth-storage';
import { HttpAuthApi } from './http-auth-api';
import { MockAuthApi } from './mock-auth-api';
import { authActions } from './store/auth.actions';
import * as authEffects from './store/auth.effects';
import { authFeature } from './store/auth.feature';

export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MockAuthApi,
    HttpAuthApi,
    { provide: AuthApi, useFactory: () => inject(USE_MOCK_APIS) ? inject(MockAuthApi) : inject(HttpAuthApi) },
    provideState(authFeature),
    provideEffects(authEffects),
    // Runs before the first navigation, so guards see a restored session.
    provideAppInitializer(() => {
      const session = inject(AuthStorage).read();
      if (session) inject(Store).dispatch(authActions.sessionRestored({ session }));
    }),
  ]);
}
