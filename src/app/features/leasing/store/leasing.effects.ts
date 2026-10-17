import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, filter, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { saveFile } from '../../../shared/utils/save-file';
import { LeasingApi } from '../data/leasing-api';
import { leasingApiActions, leasingListActions } from './leasing.actions';
import { leasingFeature } from './leasing.feature';

const message = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.');

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(LeasingApi), store = inject(Store)) =>
    actions$.pipe(
      ofType(leasingListActions.opened, leasingListActions.queryChanged, leasingApiActions.deleted),
      switchMap(() =>
        api.list(store.selectSignal(leasingFeature.selectQuery)()).pipe(
          map((page) => leasingApiActions.loaded({ page })),
          catchError((error) => of(leasingApiActions.loadFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

/** After deleting the last row of the last page, step back a page. */
export const stepBackFromEmptyPage$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(leasingApiActions.loaded),
      filter(({ page }) => page.items.length === 0 && page.total > 0),
      map(({ page }) => {
        const { pageSize } = store.selectSignal(leasingFeature.selectQuery)();
        return leasingListActions.queryChanged({ query: { page: Math.ceil(page.total / pageSize) } });
      }),
    ),
  { functional: true },
);

export const delete$ = createEffect(
  (actions$ = inject(Actions), api = inject(LeasingApi)) =>
    actions$.pipe(
      ofType(leasingListActions.deleteConfirmed),
      mergeMap(({ id }) =>
        api.delete(id).pipe(
          map(() => leasingApiActions.deleted({ id })),
          catchError((error) => of(leasingApiActions.deleteFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

export const download$ = createEffect(
  (actions$ = inject(Actions), api = inject(LeasingApi)) =>
    actions$.pipe(
      ofType(leasingListActions.downloadConfirmed),
      exhaustMap(({ ids }) =>
        api.export(ids).pipe(
          tap((blob) => saveFile(blob, 'leasing-reports.csv')),
          map(() => leasingApiActions.downloaded()),
          catchError((error) => of(leasingApiActions.downloadFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);
