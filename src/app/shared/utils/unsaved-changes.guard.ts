import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { map, of } from 'rxjs';
import { ConfirmDialogService } from '../ui';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Figma discard dialog (317:3155). Leaves only on an explicit "Leave & Discard". */
export function confirmDiscard(confirmDialog: ConfirmDialogService) {
  return confirmDialog
    .ask({
      title: 'Are you sure you want to discard report?',
      message:
        'You have unsaved changes. If you leave now, the report will not be created and all entered information will be lost.',
      tone: 'warning',
      cancelLabel: 'Leave & Discard',
      cancelVariant: 'danger-subtle',
      confirmLabel: 'Stay on page',
    })
    .pipe(map((result) => result === false));
}

/** Asks before leaving a page with unsaved edits (sidebar, back button, browser back). */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  component.hasUnsavedChanges() ? confirmDiscard(inject(ConfirmDialogService)) : of(true);
