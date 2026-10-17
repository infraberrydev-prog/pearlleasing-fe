import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  linkedSignal,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Day {
  date: Date;
  key: number;
  inMonth: boolean;
  disabled: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  /** Where an in-range cell sits within its week row, for rounding the band's ends. */
  rowStart: boolean;
  rowEnd: boolean;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const LONG_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const keyOf = (d: Date) => startOfDay(d).getTime();
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * Figma "Date picker menu" (385:20539): month navigation, start – end fields,
 * Monday-first grid of 40px cells. First click sets the start, second sets the end
 * (swapped if earlier). Arrow keys move between days; Enter/Space selects.
 * Works with `formControl` / `[(ngModel)]` as a `DateRange`.
 */
@Component({
  selector: 'app-date-range-calendar',
  imports: [Icon],
  templateUrl: './date-range-calendar.html',
  styleUrl: './date-range-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateRangeCalendar), multi: true },
  ],
})
export class DateRangeCalendar implements ControlValueAccessor {
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  /** Injected for tests; defaults to the real date. */
  readonly today = input<Date>(new Date());

  protected readonly weekdays = WEEKDAYS;
  protected readonly range = signal<DateRange>({ start: null, end: null });
  /** First day of the month on screen; follows `today` until the user navigates or a value arrives. */
  private readonly viewMonth = linkedSignal(() => new Date(this.today().getFullYear(), this.today().getMonth(), 1));
  protected readonly focusedKey = signal<number | null>(null);
  protected readonly isDisabled = signal(false);

  private readonly cells = viewChildren<ElementRef<HTMLButtonElement>>('cell');
  private onChange: (value: DateRange) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly monthLabel = computed(() => MONTH_FORMAT.format(this.viewMonth()));
  protected readonly startLabel = computed(() => this.format(this.range().start));
  protected readonly endLabel = computed(() => this.format(this.range().end));

  protected readonly weeks = computed<Day[][]>(() => {
    const month = this.viewMonth();
    // Monday-first: getDay() is 0 for Sunday.
    const lead = (month.getDay() + 6) % 7;
    const first = addDays(month, -lead);
    const { start, end } = this.range();
    const startKey = start ? keyOf(start) : null;
    const endKey = end ? keyOf(end) : null;
    const todayKey = keyOf(this.today());
    const min = this.min() ? keyOf(this.min()!) : -Infinity;
    const max = this.max() ? keyOf(this.max()!) : Infinity;

    return Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = addDays(first, w * 7 + d);
        const key = date.getTime();
        const inRange = startKey !== null && endKey !== null && key > startKey && key < endKey;
        return {
          date,
          key,
          inMonth: date.getMonth() === month.getMonth(),
          disabled: key < min || key > max,
          isToday: key === todayKey,
          isStart: key === startKey,
          isEnd: key === endKey,
          inRange,
          rowStart: d === 0,
          rowEnd: d === 6,
        };
      }),
    );
  });

  /** The one day in the grid that takes Tab focus (roving tabindex). */
  protected readonly tabbableKey = computed(() => {
    const keys = this.weeks().flat();
    const focused = this.focusedKey();
    if (focused !== null && keys.some((d) => d.key === focused)) return focused;
    const start = this.range().start;
    const preferred = start ? keyOf(start) : keyOf(this.today());
    return keys.some((d) => d.key === preferred && d.inMonth)
      ? preferred
      : keys.find((d) => d.inMonth)!.key;
  });

  writeValue(value: DateRange | null): void {
    const next = { start: value?.start ?? null, end: value?.end ?? null };
    this.range.set(next);
    const anchor = next.start ?? this.today();
    this.viewMonth.set(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  }

  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected shiftMonth(delta: number): void {
    const m = this.viewMonth();
    this.viewMonth.set(new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  protected select(day: Day): void {
    if (day.disabled || this.isDisabled()) return;
    const { start, end } = this.range();
    let next: DateRange;
    if (!start || end) {
      next = { start: day.date, end: null };
    } else if (day.key < keyOf(start)) {
      next = { start: day.date, end: start };
    } else {
      next = { start, end: day.date };
    }
    this.range.set(next);
    this.focusedKey.set(day.key);
    if (!day.inMonth) this.viewMonth.set(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
    this.onChange(next);
    this.onTouched();
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const current = new Date(this.tabbableKey());
    const next = addDays(current, step);
    if (next.getMonth() !== this.viewMonth().getMonth()) {
      this.viewMonth.set(new Date(next.getFullYear(), next.getMonth(), 1));
    }
    this.focusedKey.set(next.getTime());
    // Focus after the grid re-renders.
    queueMicrotask(() => {
      const target = this.cells().find((c) => c.nativeElement.dataset['key'] === String(next.getTime()));
      target?.nativeElement.focus();
    });
  }

  protected dayLabel(day: Day): string {
    return LONG_FORMAT.format(day.date);
  }

  private format(date: Date | null): string | null {
    return date ? DATE_FORMAT.format(date) : null;
  }
}
