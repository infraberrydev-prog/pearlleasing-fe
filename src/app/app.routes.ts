import { Routes } from '@angular/router';
import { authGuard } from './core/auth';

export const routes: Routes = [
  // Outside the shell
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  // Temporary review page for shared UI primitives; remove once the real screens exist.
  {
    path: 'dev/ui',
    loadComponent: () => import('./dev/ui-gallery/ui-gallery').then((m) => m.UiGallery),
  },

  // Inside the shell (signed-in only)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'leasing' },
      {
        path: 'leasing',
        loadChildren: () => import('./features/leasing/leasing.routes').then((m) => m.leasingRoutes),
      },
      {
        path: 'expenses',
        loadChildren: () =>
          import('./features/expenses/expenses.routes').then((m) => m.expensesRoutes),
      },
      {
        path: 'more',
        title: 'More · Pearl Place',
        loadComponent: () => import('./layout/more/more-page').then((m) => m.MorePage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
