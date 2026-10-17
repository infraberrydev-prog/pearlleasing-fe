import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { authFeature } from './store/auth.feature';

/** App pages: signed-in users only. */
export const authGuard: CanActivateFn = () => {
  const signedIn = inject(Store).selectSignal(authFeature.selectIsAuthenticated)();
  return signedIn || inject(Router).createUrlTree(['/login']);
};

/** Login page: send signed-in users to the app. */
export const guestGuard: CanActivateFn = () => {
  const signedIn = inject(Store).selectSignal(authFeature.selectIsAuthenticated)();
  return !signedIn || inject(Router).createUrlTree(['/']);
};

/** 2FA page: only after a correct username/password. */
export const otpChallengeGuard: CanActivateFn = () => {
  const store = inject(Store);
  if (store.selectSignal(authFeature.selectIsAuthenticated)()) {
    return inject(Router).createUrlTree(['/']);
  }
  return !!store.selectSignal(authFeature.selectChallenge)() || inject(Router).createUrlTree(['/login']);
};
