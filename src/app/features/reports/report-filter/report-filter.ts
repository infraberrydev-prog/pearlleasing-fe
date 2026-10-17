import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Button,
  DateRange,
  DateRangeCalendar,
  Icon,
  InputField,
  PanelActions,
  PanelSection,
} from '../../../shared/ui';
import { EMPTY_FILTER, ReportFilter, UpdatedFilter } from '../models/report';

const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const toIso = (date: Date | null) =>
  date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : null;
const toDate = (iso: string | null) => (iso ? new Date(iso) : null);
const toNumber = (text: string | null) => {
  const value = Number((text ?? '').replace(/[^\d.]/g, ''));
  return text && text.trim() !== '' && !Number.isNaN(value) ? value : null;
};

/**
 * Filter panel content (Figma 568:10951 desktop, 385:11240 mobile): Date Created,
 * amount min–max, Last Updated, then Clear | Apply. The date field opens the range
 * calendar inline (Figma's mobile "Date Range" sheet, 385:11435).
 */
@Component({
  selector: 'app-report-filter',
  imports: [ReactiveFormsModule, Button, DateRangeCalendar, Icon, InputField, PanelActions, PanelSection],
  templateUrl: './report-filter.html',
  styleUrl: './report-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportFilterPanel {
  readonly value = input<ReportFilter>(EMPTY_FILTER);
  readonly amountLabel = input.required<string>();
  readonly applied = output<ReportFilter>();

  protected readonly form = new FormGroup({
    created: new FormControl<DateRange>({ start: null, end: null }, { nonNullable: true }),
    amountMin: new FormControl<string>('', { nonNullable: true }),
    amountMax: new FormControl<string>('', { nonNullable: true }),
    updated: new FormControl<UpdatedFilter>('all', { nonNullable: true }),
  });
  protected readonly calendarOpen = signal(false);
  private readonly created = signal<DateRange>({ start: null, end: null });

  protected readonly createdLabel = computed(() => {
    const { start, end } = this.created();
    if (!start) return null;
    return end ? `${DATE.format(start)} – ${DATE.format(end)}` : DATE.format(start);
  });

  protected readonly updatedOptions: { value: UpdatedFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'updated', label: 'Updated' },
    { value: 'not-updated', label: 'Not yet updated' },
  ];

  constructor() {
    effect(() => {
      const value = this.value();
      const created = { start: toDate(value.createdFrom), end: toDate(value.createdTo) };
      this.form.setValue({
        created,
        amountMin: value.amountMin?.toString() ?? '',
        amountMax: value.amountMax?.toString() ?? '',
        updated: value.updated,
      });
      this.created.set(created);
    });
    this.form.controls.created.valueChanges.subscribe((range) => this.created.set(range));
  }

  protected apply(): void {
    const { created, amountMin, amountMax, updated } = this.form.getRawValue();
    let min = toNumber(amountMin);
    let max = toNumber(amountMax);
    if (min !== null && max !== null && min > max) [min, max] = [max, min];
    const start = created.start;
    this.applied.emit({
      createdFrom: toIso(start),
      // A single picked day filters that day only.
      createdTo: toIso(created.end ?? start),
      amountMin: min,
      amountMax: max,
      updated,
    });
  }

  protected clear(): void {
    this.calendarOpen.set(false);
    this.applied.emit(EMPTY_FILTER);
  }
}
