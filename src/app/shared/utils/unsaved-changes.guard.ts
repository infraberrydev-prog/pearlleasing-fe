import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { map, of } from 'rxjs';
import { ConfirmDialogService } from '../ui';

/** `create`: discarding a new report (Figma 317:3155). `edit`: cancelling changes (Figma 318:3801). */
export type DiscardKind = 'create' | 'edit';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  /** Which discard wording to use; defaults to `create`. */
  discardKind?(): DiscardKind;
}

/** Asks before throwing away edits. Leaves only on an explicit "Leave & Discard". */
export function confirmDiscard(confirmDialog: ConfirmDialogService, kind: DiscardKind = 'create') {
  return confirmDialog
    .ask({
      title:
        kind === 'edit'
          ? 'Are you sure you want to cancel edit?'
          : 'Are you sure you want to discard report?',
      message:
        kind === 'edit'
          ? // Figma 318:3801 shows placeholder "Text" here.
            'You have unsaved changes. If you leave now, your changes to this report will be lost.'
          : 'You have unsaved changes. If you leave now, the report will not be created and all entered information will be lost.',
      tone: 'warning',
      cancelLabel: 'Leave & Discard',
      cancelVariant: 'danger-subtle',
      confirmLabel: 'Stay on page',
    })
    .pipe(map((result) => result === false));
}

/** Asks before leaving a page with unsaved edits (sidebar, back button, browser back). */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  component.hasUnsavedChanges()
    ? confirmDiscard(inject(ConfirmDialogService), component.discardKind?.() ?? 'create')
    : of(true);
