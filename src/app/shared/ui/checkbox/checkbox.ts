import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Figma "Checkbox" (20×20, md). The label is projected content.
 * Only the unchecked state is drawn in Figma; checked/indeterminate use the brand fill.
 */
@Component({
  selector: 'app-checkbox',
  template: `
    <label class="wrapper">
      <input
        type="checkbox"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel() ?? null"
        (change)="toggle($event)"
        (blur)="onTouched()"
      />
      <span class="box" aria-hidden="true"></span>
      <ng-content />
    </label>
  `,
  styleUrl: './checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true }],
})
export class Checkbox implements ControlValueAccessor {
  readonly checked = model(false);
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** For checkboxes without visible text (table row selection). */
  readonly ariaLabel = input<string>();

  protected readonly isDisabled = signal(false);
  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected toggle(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }
}
