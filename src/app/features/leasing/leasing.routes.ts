import { Routes } from '@angular/router';

export const leasingRoutes: Routes = [
  {
    path: '',
    title: 'Leasing Reports · Pearl Place',
    loadComponent: () => import('./pages/leasing-list/leasing-list').then((m) => m.LeasingList),
  },
];
