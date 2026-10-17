import { Routes } from '@angular/router';

export const routes: Routes = [
  // Temporary review page for shared UI primitives; remove once the real screens exist.
  {
    path: 'dev/ui',
    loadComponent: () => import('./dev/ui-gallery/ui-gallery').then((m) => m.UiGallery),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dev/ui' },
];
