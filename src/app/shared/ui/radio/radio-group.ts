import { ChangeDetectionStrategy, Component, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/** Holds the selected value for its `app-radio` children. Bind with `formControlName` or `[(value)]`. */
@Component({
  selector: 'app-radio-group',
  template: '<ng-content />',
  styles: ':host { display: flex; flex-direction: column; gap: var(--spacing-md); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioGroup), multi: true }],
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
})
export class RadioGroup<T = unknown> implements ControlValueAccessor {
  readonly value = model<T | null>(null);
  readonly name = input(`app-radio-group-${nextId++}`);
  readonly ariaLabel = input<string>();

  readonly disabled = signal(false);
  private onChange: (value: T) => void = () => {};
  onTouched: () => void = () => {};

  select(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
