import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Figma "Verification code input field": one box per digit.
 * Value is the digits typed so far (e.g. "8251"). Typing advances, Backspace goes back,
 * pasting fills every box. Emits `completed` once all boxes are filled.
 */
@Component({
  selector: 'app-otp-input',
  templateUrl: './otp-input.html',
  styleUrl: './otp-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OtpInput), multi: true }],
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.is-invalid]': '!!error()',
  },
})
export class OtpInput implements ControlValueAccessor {
  readonly length = input(6);
  readonly error = input<string | null>();
  readonly ariaLabel = input('Verification code');
  readonly completed = output<string>();

  protected readonly digits = signal<string[]>([]);
  protected readonly isDisabled = signal(false);
  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');
  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.digits.set(this.sanitize(value ?? '').split(''));
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

  /** Focus the first empty box (or the last one when full). */
  focus(): void {
    const index = Math.min(this.digits().length, this.length() - 1);
    this.boxes()[index]?.nativeElement.focus();
  }

  protected handleInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const typed = this.sanitize(target.value);
    if (!typed) {
      target.value = this.digits()[index] ?? '';
      return;
    }
    // Several digits arrive at once from autofill (autocomplete="one-time-code").
    this.fillFrom(index, typed);
  }

  protected handleKeydown(index: number, event: KeyboardEvent): void {
    const boxes = this.boxes();
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...this.digits()];
      // Clear this box, or the previous one when this box is already empty.
      const clearAt = next[index] ? index : index - 1;
      if (clearAt < 0) return;
      next.splice(clearAt);
      this.update(next);
      boxes[clearAt]?.nativeElement.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      boxes[index - 1].nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < boxes.length - 1) {
      event.preventDefault();
      boxes[index + 1].nativeElement.focus();
    }
  }

  protected handlePaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = this.sanitize(event.clipboardData?.getData('text') ?? '');
    if (pasted) this.fillFrom(index, pasted);
  }

  protected selectOnFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  private fillFrom(index: number, typed: string): void {
    // Digits stay contiguous: typing into a later box appends after the last filled one.
    const start = Math.min(index, this.digits().length);
    const next = [...this.digits().slice(0, start), ...typed.split('')].slice(0, this.length());
    this.update(next);
    this.boxes()[Math.min(next.length, this.length() - 1)]?.nativeElement.focus();
  }

  private update(next: string[]): void {
    this.digits.set(next);
    const value = next.join('');
    this.onChange(value);
    if (value.length === this.length()) this.completed.emit(value);
  }

  private sanitize(value: string): string {
    return value.replace(/\D/g, '').slice(0, this.length());
  }
}
