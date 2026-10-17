import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button, Option, OptionList, PanelActions } from '../../../shared/ui';
import { ReportSort } from '../models/report';

/** Sort panel content (Figma 566:27059): six options, then Clear | Apply. */
@Component({
  selector: 'app-report-sort',
  imports: [ReactiveFormsModule, Button, OptionList, PanelActions],
  template: `
    <app-option-list [options]="options()" [formControl]="choice" ariaLabel="Sort by" />
    <app-panel-actions>
      <button app-button type="button" variant="secondary" size="sm" (click)="clear()">Clear</button>
      <button app-button type="button" size="sm" (click)="applied.emit(choice.value)">Apply</button>
    </app-panel-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSortPanel {
  readonly value = input<ReportSort | null>(null);
  /** "Expected Revenue" / "Total Expenses". */
  readonly amountLabel = input.required<string>();
  readonly applied = output<ReportSort | null>();

  protected readonly choice = new FormControl<ReportSort | null>(null);
  protected readonly options = computed<Option<ReportSort>[]>(() => [
    { value: 'amount-desc', label: `${this.amountLabel()}: Highest first` },
    { value: 'amount-asc', label: `${this.amountLabel()}: Lowest first` },
    { value: 'created-desc', label: 'Date Created: Newest first' },
    { value: 'created-asc', label: 'Date Created: Oldest first' },
    { value: 'updated-desc', label: 'Last Updated: Newest first' },
    { value: 'updated-asc', label: 'Last Updated: Oldest first' },
  ]);

  constructor() {
    effect(() => this.choice.setValue(this.value()));
  }

  protected clear(): void {
    this.choice.setValue(null);
    this.applied.emit(null);
  }
}
