import { Routes } from '@angular/router';

export const expensesRoutes: Routes = [
  {
    path: '',
    title: 'Expenses Reports · Pearl Place',
    loadComponent: () =>
      import('./pages/expenses-list/expenses-list').then((m) => m.ExpensesList),
  },
];
