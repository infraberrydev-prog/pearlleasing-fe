import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { Alert } from '../alert/alert';

/**
 * Success toast at the top right of the page (Figma 65:3364 / 69:1655, "Report successfully
 * submitted!"). Shows while `message` is set and asks to be dismissed after `duration` ms.
 */
@Component({
  selector: 'app-notice-toast',
  imports: [Alert],
  template: `
    @if (message(); as text) {
      <app-alert class="toast" tone="success" dismissible (dismissed)="dismissed.emit()">{{ text }}</app-alert>
    }
  `,
  styles: `
    /* The toast is fixed-position; the host must not take up space in the page layout. */
    :host {
      display: contents;
    }
    .toast {
      position: fixed;
      top: var(--spacing-3xl);
      right: var(--spacing-3xl);
      z-index: 30;
      width: 360px;
      max-width: calc(100vw - 32px);
      box-shadow: var(--shadow-lg);
    }
    @media (max-width: 767.98px) {
      .toast {
        top: var(--spacing-xl);
        right: var(--spacing-xl);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticeToast {
  readonly message = input<string | null>(null);
  readonly duration = input(5000);
  readonly dismissed = output<void>();

  constructor() {
    effect((onCleanup) => {
      if (!this.message()) return;
      const timer = setTimeout(() => this.dismissed.emit(), this.duration());
      onCleanup(() => clearTimeout(timer));
    });
  }
}
