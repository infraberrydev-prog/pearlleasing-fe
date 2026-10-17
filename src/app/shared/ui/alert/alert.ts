import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Figma "Alert vuetify".
 * - `error`: inline form error ("Incorrect username or password.")
 * - `success`: dark green toast ("Report successfully submitted!") with a close button
 */
export type AlertTone = 'error' | 'success';

@Component({
  selector: 'app-alert',
  imports: [Icon],
  template: `
    <p class="message"><ng-content /></p>
    @if (dismissible()) {
      <button type="button" class="close" aria-label="Dismiss" (click)="dismissed.emit()">
        <app-icon name="close-inverse" />
      </button>
    }
  `,
  styleUrl: './alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"app-alert--" + tone()',
    '[attr.role]': 'tone() === "error" ? "alert" : "status"',
  },
})
export class Alert {
  readonly tone = input<AlertTone>('error');
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();
}
