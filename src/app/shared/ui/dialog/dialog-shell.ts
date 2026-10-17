import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Figma "Modal" container: white card, 24px padding, 16px radius, shadow/lg,
 * close (x-03) in the top-right corner. Content is projected.
 */
@Component({
  selector: 'app-dialog-shell',
  imports: [Icon],
  template: `
    <ng-content />
    @if (closable()) {
      <button type="button" class="close" aria-label="Close" (click)="closed.emit()">
        <app-icon name="x-03" />
      </button>
    }
  `,
  styleUrl: './dialog-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogShell {
  readonly closable = input(true, { transform: booleanAttribute });
  readonly closed = output<void>();
}
