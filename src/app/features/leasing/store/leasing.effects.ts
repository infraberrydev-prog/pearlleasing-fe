import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, catchError, exhaustMap, filter, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { saveFile } from '../../../shared/utils/save-file';
import { LeasingApi } from '../data/leasing-api';
import { leasingApiActions, leasingEditorActions, leasingListActions } from './leasing.actions';
import { leasingFeature } from './leasing.feature';

const message = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.');

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(LeasingApi), store = inject(Store)) =>
    actions$.pipe(
      ofType(leasingListActions.opened, leasingListActions.queryChanged, leasingApiActions.deleted),
      // Search, sort, filter and paging reuse the loaded list; opening the page or deleting reloads it.
      switchMap(({ type }) =>
        api.list(store.selectSignal(leasingFeature.selectQuery)(), type !== leasingListActions.queryChanged.type).pipe(
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
          tap((files) => files.forEach(({ blob, fileName }) => saveFile(blob, fileName))),
          map(() => leasingApiActions.downloaded()),
          catchError((error) => of(leasingApiActions.downloadFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

export const loadDetail$ = createEffect(
  (actions$ = inject(Actions), api = inject(LeasingApi)) =>
    actions$.pipe(
      ofType(leasingEditorActions.opened),
      switchMap(({ id }) =>
        id === null
          ? EMPTY
          : api.get(id).pipe(
              map((report) => leasingApiActions.detailLoaded({ report })),
              catchError((error) => of(leasingApiActions.detailLoadFailed({ error: message(error) }))),
            ),
      ),
    ),
  { functional: true },
);

export const loadLookups$ = createEffect(
  (actions$ = inject(Actions), api = inject(LeasingApi), store = inject(Store)) =>
    actions$.pipe(
      ofType(leasingEditorActions.opened),
      filter(() => store.selectSignal(leasingFeature.selectLookups)() === null),
      switchMap(() => api.lookups().pipe(map((lookups) => leasingApiActions.lookupsLoaded({ lookups })))),
    ),
  { functional: true },
);

export const save$ = createEffect(
  (actions$ = inject(Actions), api = inject(LeasingApi)) =>
    actions$.pipe(
      ofType(leasingEditorActions.submitted),
      exhaustMap(({ id, draft }) =>
        (id === null ? api.create(draft) : api.update(id, draft)).pipe(
          map((report) => leasingApiActions.saved({ report, created: id === null })),
          catchError((error) => of(leasingApiActions.saveFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

/** Back to the list, which shows the success notice. */
export const afterSave$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(leasingApiActions.saved),
      tap(() => router.navigateByUrl('/leasing')),
    ),
  { functional: true, dispatch: false },
);
