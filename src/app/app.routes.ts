import { Routes } from '@angular/router';
import { authGuard } from './core/auth';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  // Temporary review page for shared UI primitives; remove once the real screens exist.
  {
    path: 'dev/ui',
    loadComponent: () => import('./dev/ui-gallery/ui-gallery').then((m) => m.UiGallery),
  },
  // Signed-in landing page. Becomes the app shell (step 4); shows the UI gallery until then.
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () => import('./dev/ui-gallery/ui-gallery').then((m) => m.UiGallery),
  },
  { path: '**', redirectTo: '' },
];
