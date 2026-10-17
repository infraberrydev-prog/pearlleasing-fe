import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Button, ButtonVariant } from '../button/button';
import { Icon, IconName } from '../icon/icon';
import { DialogShell } from './dialog-shell';

export type ConfirmDialogTone = 'warning' | 'danger' | 'primary';

export interface ConfirmDialogData {
  title: string;
  message?: string;
  tone?: ConfirmDialogTone;
  /** Featured icon; defaults to the tone's information icon. */
  icon?: IconName;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  cancelVariant?: ButtonVariant;
}

/**
 * Confirmation modal used for discard / cancel edit / delete / log out.
 * Closes with `true` when confirmed, `false` when cancelled, `undefined` when dismissed.
 * Open it through `ConfirmDialogService`.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [DialogShell, Icon, Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);

  protected readonly tone = computed(() => this.data.tone ?? 'warning');
  protected readonly icon = computed<IconName>(
    () =>
      this.data.icon ??
      (this.tone() === 'danger'
        ? 'information-circle-contained-danger'
        : 'information-circle-contained-warning'),
  );
}
