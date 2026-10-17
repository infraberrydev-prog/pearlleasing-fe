import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, catchError, exhaustMap, filter, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { saveFile } from '../../../shared/utils/save-file';
import { ExpensesApi } from '../data/expenses-api';
import { expensesApiActions, expensesEditorActions, expensesListActions } from './expenses.actions';
import { expensesFeature } from './expenses.feature';

const message = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.');

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(ExpensesApi), store = inject(Store)) =>
    actions$.pipe(
      ofType(expensesListActions.opened, expensesListActions.queryChanged, expensesApiActions.deleted),
      switchMap(() =>
        api.list(store.selectSignal(expensesFeature.selectQuery)()).pipe(
          map((page) => expensesApiActions.loaded({ page })),
          catchError((error) => of(expensesApiActions.loadFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

/** After deleting the last row of the last page, step back a page. */
export const stepBackFromEmptyPage$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(expensesApiActions.loaded),
      filter(({ page }) => page.items.length === 0 && page.total > 0),
      map(({ page }) => {
        const { pageSize } = store.selectSignal(expensesFeature.selectQuery)();
        return expensesListActions.queryChanged({ query: { page: Math.ceil(page.total / pageSize) } });
      }),
    ),
  { functional: true },
);

export const delete$ = createEffect(
  (actions$ = inject(Actions), api = inject(ExpensesApi)) =>
    actions$.pipe(
      ofType(expensesListActions.deleteConfirmed),
      mergeMap(({ id }) =>
        api.delete(id).pipe(
          map(() => expensesApiActions.deleted({ id })),
          catchError((error) => of(expensesApiActions.deleteFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

export const download$ = createEffect(
  (actions$ = inject(Actions), api = inject(ExpensesApi)) =>
    actions$.pipe(
      ofType(expensesListActions.downloadConfirmed),
      exhaustMap(({ ids }) =>
        api.export(ids).pipe(
          tap((blob) => saveFile(blob, 'expenses-reports.csv')),
          map(() => expensesApiActions.downloaded()),
          catchError((error) => of(expensesApiActions.downloadFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

export const loadDetail$ = createEffect(
  (actions$ = inject(Actions), api = inject(ExpensesApi)) =>
    actions$.pipe(
      ofType(expensesEditorActions.opened),
      switchMap(({ id }) =>
        id === null
          ? EMPTY
          : api.get(id).pipe(
              map((report) => expensesApiActions.detailLoaded({ report })),
              catchError((error) => of(expensesApiActions.detailLoadFailed({ error: message(error) }))),
            ),
      ),
    ),
  { functional: true },
);

export const save$ = createEffect(
  (actions$ = inject(Actions), api = inject(ExpensesApi)) =>
    actions$.pipe(
      ofType(expensesEditorActions.submitted),
      exhaustMap(({ id, draft }) =>
        (id === null ? api.create(draft) : api.update(id, draft)).pipe(
          map((report) => expensesApiActions.saved({ report, created: id === null })),
          catchError((error) => of(expensesApiActions.saveFailed({ error: message(error) }))),
        ),
      ),
    ),
  { functional: true },
);

/** Back to the list, which shows the success notice. */
export const afterSave$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(expensesApiActions.saved),
      tap(() => router.navigateByUrl('/expenses')),
    ),
  { functional: true, dispatch: false },
);
