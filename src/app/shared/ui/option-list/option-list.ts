import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Radio } from '../radio/radio';
import { RadioGroup } from '../radio/radio-group';

export interface Option<T> {
  value: T;
  label: string;
}

/**
 * Single-choice list in menu style (Figma sort menu 566:27059): 48px rows,
 * label on the left, radio on the right. Bind with `formControl` or `[(value)]`.
 */
@Component({
  selector: 'app-option-list',
  imports: [Radio],
  template: `
    @for (option of options(); track option.value) {
      <app-radio class="option" labelPosition="before" [value]="option.value">
        {{ option.label }}
      </app-radio>
    }
  `,
  styleUrl: './option-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: RadioGroup, useExisting: forwardRef(() => OptionList) },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OptionList), multi: true },
  ],
  host: { role: 'radiogroup', '[attr.aria-label]': 'ariaLabel() ?? null' },
})
export class OptionList<T = unknown> extends RadioGroup<T> {
  readonly options = input.required<readonly Option<T>[]>();
}
