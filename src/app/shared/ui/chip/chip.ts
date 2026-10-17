import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Figma "Chips" — status pill. `warning` matches the "Unpaid" chip;
 * `success` (for "Paid") uses the success tokens and still needs a check against Figma.
 */
export type ChipTone = 'warning' | 'success' | 'neutral';

@Component({
  selector: 'app-chip',
  template: '<ng-content />',
  styleUrl: './chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"app-chip--" + tone()' },
})
export class Chip {
  readonly tone = input<ChipTone>('neutral');
}
