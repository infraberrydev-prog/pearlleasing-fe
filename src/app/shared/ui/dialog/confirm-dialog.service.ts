import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);

  /** Emits `true` only when the user presses the confirm button. */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this.ask(data).pipe(map((result) => result === true));
  }

  /**
   * Emits `true` (confirm button), `false` (cancel button) or `undefined` (closed with
   * the X, Escape or the backdrop). Use it when cancel and dismiss mean different things.
   */
  ask(data: ConfirmDialogData): Observable<boolean | undefined> {
    const ref = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialog, {
      data,
      backdropClass: 'app-dialog-backdrop',
      ariaLabelledBy: 'confirm-dialog-title',
      ariaDescribedBy: data.message ? 'confirm-dialog-message' : null,
      role: 'alertdialog',
    });
    return ref.closed;
  }
}
