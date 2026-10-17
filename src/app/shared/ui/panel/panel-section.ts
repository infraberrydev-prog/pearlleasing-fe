import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Divider } from '../divider/divider';

/** Labelled block inside a panel (Figma 568:10953): 12px 16px padding, label then content, 16px apart. */
@Component({
  selector: 'app-panel-section',
  template: `
    @if (label()) {
      <p class="label" [id]="labelId">{{ label() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
      padding: var(--spacing-lg) var(--spacing-xl);
    }
    .label {
      margin: 0;
      font-size: var(--text-md-size);
      line-height: var(--text-md-line);
      color: var(--color-text-default);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-labelledby]': 'label() ? labelId : null' },
})
export class PanelSection {
  private static nextId = 0;
  readonly label = input<string>();
  protected readonly labelId = `app-panel-section-${PanelSection.nextId++}`;
}

/**
 * Panel footer: divider, then the buttons. Side by side in a dropdown (Clear | Apply,
 * Figma 568:10967); stacked with the primary on top in a mobile sheet (385:20608).
 * Project the buttons in reading order: secondary first, primary last.
 */
@Component({
  selector: 'app-panel-actions',
  imports: [Divider],
  template: `
    <app-divider />
    <div class="buttons"><ng-content /></div>
  `,
  styleUrl: './panel-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelActions {}
