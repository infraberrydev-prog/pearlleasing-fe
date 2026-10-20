import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, catchError, exhaustMap, map, mergeMap, of, tap } from 'rxjs';
import { AuthApi } from '../auth-api';
import { AuthStorage } from '../auth-storage';
import { AuthError, AuthErrorCode } from '../auth.models';
import { authActions } from './auth.actions';
import { authFeature } from './auth.feature';

const toCode = (error: unknown): AuthErrorCode =>
  error instanceof AuthError ? error.code : 'unknown';

export const login$ = createEffect(
  (actions$ = inject(Actions), api = inject(AuthApi)) =>
    actions$.pipe(
      ofType(authActions.login),
      exhaustMap(({ credentials }) =>
        api.login(credentials).pipe(
          map((challenge) => authActions.loginSucceeded({ challenge })),
          catchError((error) => of(authActions.loginFailed({ error: toCode(error) }))),
        ),
      ),
    ),
  { functional: true },
);

export const verifyOtp$ = createEffect(
  (actions$ = inject(Actions), api = inject(AuthApi), store = inject(Store)) =>
    actions$.pipe(
      ofType(authActions.verifyOtp),
      exhaustMap(({ code }) => {
        const challenge = store.selectSignal(authFeature.selectChallenge)();
        if (!challenge) return of(authActions.backToLogin());
        return api.verifyOtp(challenge.challengeId, code).pipe(
          map((session) => authActions.verifyOtpSucceeded({ session })),
          catchError((error) => of(authActions.verifyOtpFailed({ error: toCode(error) }))),
        );
      }),
    ),
  { functional: true },
);

export const resendOtp$ = createEffect(
  (actions$ = inject(Actions), api = inject(AuthApi), store = inject(Store)) =>
    actions$.pipe(
      ofType(authActions.resendOtp),
      exhaustMap(() => {
        const challenge = store.selectSignal(authFeature.selectChallenge)();
        if (!challenge) return EMPTY;
        return api.resendOtp(challenge.challengeId).pipe(
          map((next) => authActions.resendOtpSucceeded({ challenge: next })),
          catchError((error) => of(authActions.resendOtpFailed({ error: toCode(error) }))),
        );
      }),
    ),
  { functional: true },
);

export const goToOtp$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(authActions.loginSucceeded),
      tap(() => router.navigateByUrl('/login/verify')),
    ),
  { functional: true, dispatch: false },
);

export const signedIn$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router), storage = inject(AuthStorage)) =>
    actions$.pipe(
      ofType(authActions.verifyOtpSucceeded),
      tap(({ session }) => {
        storage.write(session);
        router.navigateByUrl('/');
      }),
    ),
  { functional: true, dispatch: false },
);

export const signedOut$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router), storage = inject(AuthStorage), api = inject(AuthApi)) =>
    actions$.pipe(
      ofType(authActions.logout, authActions.sessionExpired, authActions.backToLogin),
      mergeMap(({ type }) => {
        // The store is already cleared by now, so take the token from storage before dropping it.
        const token = storage.read()?.token;
        storage.clear();
        router.navigateByUrl('/login');
        return type === authActions.logout.type && token
          ? api.logout(token).pipe(catchError(() => EMPTY))
          : EMPTY;
      }),
    ),
  { functional: true, dispatch: false },
);
