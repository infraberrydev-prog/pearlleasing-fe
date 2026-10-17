import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { unsavedChangesGuard } from '../../shared/utils/unsaved-changes.guard';
import { ExpensesApi, MockExpensesApi } from './data/expenses-api';
import * as expensesEffects from './store/expenses.effects';
import { expensesFeature } from './store/expenses.feature';

export const expensesRoutes: Routes = [
  {
    path: '',
    providers: [
      // Swap for the HTTP implementation once the backend contract is known.
      { provide: ExpensesApi, useClass: MockExpensesApi },
      provideState(expensesFeature),
      provideEffects(expensesEffects),
    ],
    children: [
      {
        path: '',
        title: 'Expenses Reports · Pearl Place',
        loadComponent: () => import('./pages/expenses-list/expenses-list').then((m) => m.ExpensesList),
      },
      {
        path: 'new',
        title: 'Create Report · Pearl Place',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/expenses-editor/expenses-editor').then((m) => m.ExpensesEditor),
      },
      {
        path: ':id',
        title: 'Report · Pearl Place',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/expenses-editor/expenses-editor').then((m) => m.ExpensesEditor),
      },
    ],
  },
];
