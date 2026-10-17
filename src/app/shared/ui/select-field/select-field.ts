import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';

let nextId = 0;

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Figma dropdown input ("Payment Status", "Payment Method"): input styling, placeholder in
 * colors/text/disabled, chevron-down on the right. Native <select> for keyboard and mobile pickers.
 */
@Component({
  selector: 'app-select-field',
  imports: [Icon],
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectField), multi: true },
  ],
  host: { '[class.is-invalid]': '!!error()', '[class.is-disabled]': 'isDisabled()' },
})
export class SelectField implements ControlValueAccessor {
  readonly label = input<string>();
  readonly placeholder = input('Select');
  readonly options = input.required<readonly SelectOption[]>();
  readonly error = input<string | null>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly optional = input(false, { transform: booleanAttribute });
  readonly selectId = input(`app-select-${nextId++}`);

  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);
  protected readonly isEmpty = computed(() => this.value() === '');

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected handleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
