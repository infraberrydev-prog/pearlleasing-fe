import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { authActions } from './store/auth.actions';
import { authFeature } from './store/auth.feature';

/** Adds the bearer token and signs the user out when the API answers 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const token = store.selectSignal(authFeature.selectToken)();
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        store.dispatch(authActions.sessionExpired());
      }
      return throwError(() => error);
    }),
  );
};
