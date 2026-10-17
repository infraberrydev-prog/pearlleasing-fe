import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);

  /** Emits `true` only when the user presses the confirm button. */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const ref = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialog, {
      data,
      backdropClass: 'app-dialog-backdrop',
      ariaLabelledBy: 'confirm-dialog-title',
      ariaDescribedBy: data.message ? 'confirm-dialog-message' : null,
      role: 'alertdialog',
    });
    return ref.closed.pipe(map((result) => result === true));
  }
}
