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
import { Icon, IconName } from '../icon/icon';

let nextId = 0;

/**
 * Figma "Input field": label, input with optional leading icon, hint or error text.
 * Works with reactive forms (`formControlName`) and `[(ngModel)]`.
 * `type="password"` adds the eye-closed / eye-open show-hide toggle.
 *
 * Slots:
 * - `[labelAction]` — right side of the label row (e.g. "Forgot password?")
 * - `[trailing]` — inside the input, after the text
 */
@Component({
  selector: 'app-input-field',
  imports: [Icon],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputField), multi: true },
  ],
  host: {
    '[class.is-invalid]': 'invalid()',
    '[class.is-disabled]': 'isDisabled()',
  },
})
export class InputField implements ControlValueAccessor {
  readonly label = input<string>();
  readonly type = input<'text' | 'password' | 'email' | 'tel' | 'number' | 'search'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string>();
  readonly leadingIcon = input<IconName>();
  readonly hint = input<string>();
  /** Error message. Shows the danger border and replaces the hint. */
  readonly error = input<string | null>();
  /** Marks the label with a red asterisk (Figma "Report Name *"). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Appends an italic "(optional)" to the label (Figma "Mobile Number (optional)"). */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Id of a <datalist> with suggestions (searchable fields). */
  readonly list = input<string>();
  readonly inputmode = input<string>();
  /** Fixed text before the value, e.g. "₱" on amount fields (Figma "₱ 5600.00"). */
  readonly prefix = input<string>();
  /** Accessible name when there is no visible label (search boxes, min/max pairs). */
  readonly ariaLabel = input<string>();
  readonly inputId = input(`app-input-${nextId++}`);

  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly effectiveType = computed(() =>
    this.isPassword() && this.passwordVisible() ? 'text' : this.type(),
  );
  protected readonly invalid = computed(() => !!this.error());
  protected readonly describedBy = computed(() =>
    this.error() || this.hint() ? `${this.inputId()}-desc` : null,
  );

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

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
