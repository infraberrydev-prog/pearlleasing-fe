import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { unsavedChangesGuard } from '../../shared/utils/unsaved-changes.guard';
import { LeasingApi, MockLeasingApi } from './data/leasing-api';
import * as leasingEffects from './store/leasing.effects';
import { leasingFeature } from './store/leasing.feature';

export const leasingRoutes: Routes = [
  {
    path: '',
    providers: [
      // Swap for the HTTP implementation once the backend contract is known.
      { provide: LeasingApi, useClass: MockLeasingApi },
      provideState(leasingFeature),
      provideEffects(leasingEffects),
    ],
    children: [
      {
        path: '',
        title: 'Leasing Reports · Pearl Place',
        loadComponent: () => import('./pages/leasing-list/leasing-list').then((m) => m.LeasingList),
      },
      {
        path: 'new',
        title: 'Create Report · Pearl Place',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/leasing-editor/leasing-editor').then((m) => m.LeasingEditor),
      },
      // Detail page: view rows and update them, e.g. Unpaid → Paid (Figma 315:6423).
      {
        path: ':id',
        title: 'Report · Pearl Place',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/leasing-editor/leasing-editor').then((m) => m.LeasingEditor),
      },
      { path: ':id/edit', redirectTo: ':id' },
    ],
  },
];
