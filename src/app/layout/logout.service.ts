import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { authActions } from '../core/auth';
import { ConfirmDialogService } from '../shared/ui';

/** "Are you sure you want to log out?" (Figma 385:24639 / 385:24795 / 385:24309), then sign out. */
@Injectable({ providedIn: 'root' })
export class LogoutService {
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly store = inject(Store);

  confirmLogout(): void {
    this.confirmDialog
      .confirm({
        title: 'Are you sure you want to log out?',
        // Figma shows placeholder "Text" here; this copy needs confirming.
        message: 'You will need to log in again to access your reports.',
        tone: 'warning',
        cancelLabel: 'Cancel',
        confirmLabel: 'Log out',
      })
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(authActions.logout());
      });
  }
}
