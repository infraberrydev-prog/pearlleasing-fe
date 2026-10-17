import { Routes } from '@angular/router';
import { guestGuard, otpChallengeGuard } from '../../core/auth';

export const authRoutes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    title: 'Log in · Pearl Place',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'verify',
    canActivate: [otpChallengeGuard],
    title: 'Verify · Pearl Place',
    loadComponent: () => import('./two-factor/two-factor').then((m) => m.TwoFactor),
  },
];
