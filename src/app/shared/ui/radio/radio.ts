import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RadioGroup } from './radio-group';

/**
 * Figma "_Radio button base" (20×20). Must sit inside `app-radio-group`.
 * Only the unselected state is drawn in Figma; selected uses a brand ring and dot.
 */
@Component({
  selector: 'app-radio',
  template: `
    <label class="wrapper">
      <input
        type="radio"
        [name]="group.name()"
        [checked]="checked()"
        [disabled]="group.disabled()"
        (change)="group.select(value())"
        (blur)="group.onTouched()"
      />
      <span class="circle" aria-hidden="true"></span>
      <ng-content />
    </label>
  `,
  styleUrl: './radio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.label-before]': 'labelPosition() === "before"' },
})
export class Radio<T = unknown> {
  readonly value = input.required<T>();
  /** 'before' puts the label first and the circle at the far end (menu rows). */
  readonly labelPosition = input<'after' | 'before'>('after');

  protected readonly group = inject<RadioGroup<T>>(RadioGroup);
  protected readonly checked = computed(() => this.group.value() === this.value());
}
