import { Injectable, TemplateRef, inject } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';

/**
 * Mobile sheets (Figma 385:11239 filter, 385:11435 date range): the same panel as the
 * desktop dropdown, docked 8px from the bottom and sides over the dimmed backdrop.
 */
@Injectable({ providedIn: 'root' })
export class BottomSheet {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  open<R = unknown, D = unknown, C = unknown>(
    content: TemplateRef<C> | ComponentType<C>,
    options: { data?: D; ariaLabel?: string } = {},
  ): DialogRef<R, C> {
    return this.dialog.open<R, D, C>(content, {
      data: options.data,
      ariaLabel: options.ariaLabel ?? null,
      width: 'calc(100% - 16px)',
      maxWidth: '520px',
      panelClass: ['app-panel', 'app-bottom-sheet'],
      backdropClass: 'app-dialog-backdrop',
      positionStrategy: this.overlay.position().global().centerHorizontally().bottom('8px'),
      autoFocus: 'first-tabbable',
    });
  }
}
