import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { Store, provideState } from '@ngrx/store';
import { AuthApi } from './auth-api';
import { AuthStorage } from './auth-storage';
import { MockAuthApi } from './mock-auth-api';
import { authActions } from './store/auth.actions';
import * as authEffects from './store/auth.effects';
import { authFeature } from './store/auth.feature';

export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Swap for the HTTP implementation once the backend contract is known.
    { provide: AuthApi, useClass: MockAuthApi },
    provideState(authFeature),
    provideEffects(authEffects),
    // Runs before the first navigation, so guards see a restored session.
    provideAppInitializer(() => {
      const session = inject(AuthStorage).read();
      if (session) inject(Store).dispatch(authActions.sessionRestored({ session }));
    }),
  ]);
}
