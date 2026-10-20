import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { formatPeso } from '../../../../shared/pipes/format.pipes';
import { Alert, Button, ConfirmDialogService, Divider, Icon, InputField } from '../../../../shared/ui';
import { DiscardKind, HasUnsavedChanges, confirmDiscard } from '../../../../shared/utils/unsaved-changes.guard';
import { AMOUNT_PATTERN, parseAmount } from '../../../../shared/utils/amount';
import { ExpenseAmounts, ExpenseReportDetail, expenseTotal } from '../../models/expense-report';
import { expensesEditorActions } from '../../store/expenses.actions';
import { expensesFeature } from '../../store/expenses.feature';

const amount = () =>
  new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(AMOUNT_PATTERN)] });

type AmountKey = keyof ExpenseAmounts;

/**
 * Expenses report form (Figma 561:20578 create, 385:23308 view): Report Name, one "Expenses"
 * section with four required amounts, and the Total Amount.
 * `/expenses/new` creates (Discard + Submit Report); `/expenses/:id` shows and updates a report
 * (Cancel + Update Report, enabled once something changes).
 */
@Component({
  selector: 'app-expenses-editor',
  imports: [ReactiveFormsModule, Alert, Button, Divider, Icon, InputField],
  templateUrl: './expenses-editor.html',
  styleUrls: ['../../../reports/report-editor.scss', './expenses-editor.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesEditor implements HasUnsavedChanges {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly isDetail = this.id !== null;
  protected readonly editor = this.store.selectSignal(expensesFeature.selectEditor);
  /**
   * Only the report itself: saving and errors also change `editor`, and refilling the form then
   * would bring back rows the user just deleted (or wipe their edits after a failed save).
   */
  private readonly loadedReport = computed(() => this.editor().report);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    electricity: amount(),
    payroll: amount(),
    water: amount(),
    maintenance: amount(),
  });

  /** Figma field order: Electricity | Payroll, Water | Maintenance Expenses. */
  protected readonly fields: { key: AmountKey; label: string }[] = [
    { key: 'electricity', label: 'Electricity' },
    { key: 'payroll', label: 'Payroll' },
    { key: 'water', label: 'Water' },
    { key: 'maintenance', label: 'Maintenance Expenses' },
  ];

  private readonly formVersion = signal(0);
  private submitted = false;

  protected readonly title = computed(() => {
    if (!this.isDetail) return 'Create Report';
    const report = this.editor().report;
    return report ? `${report.id} - ${report.name}` : (this.id ?? '');
  });

  protected readonly total = computed(() => {
    this.formVersion();
    return formatPeso(expenseTotal(this.amounts()));
  });

  protected readonly canSubmit = computed(() => {
    this.formVersion();
    if (this.editor().saving) return false;
    if (this.isDetail) return !!this.editor().report && this.form.dirty && this.form.valid;
    return this.form.valid;
  });

  constructor() {
    this.store.dispatch(expensesEditorActions.opened({ id: this.id }));
    const destroyRef = inject(DestroyRef);
    this.form.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.bump());
    this.form.statusChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.bump());

    effect(() => {
      const report = this.loadedReport();
      if (report && this.isDetail) this.fill(report);
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.bump();
      return;
    }
    this.submitted = true;
    this.store.dispatch(
      expensesEditorActions.submitted({
        id: this.id,
        draft: { name: this.form.controls.name.value.trim(), expenses: this.amounts() },
      }),
    );
  }

  protected leave(): void {
    this.router.navigateByUrl('/expenses');
  }

  protected discard(): void {
    if (!this.form.dirty) {
      this.leave();
      return;
    }
    confirmDiscard(this.confirmDialog, this.discardKind()).subscribe((leave) => {
      if (!leave) return;
      this.form.markAsPristine();
      this.leave();
    });
  }

  hasUnsavedChanges(): boolean {
    if (this.submitted && !this.editor().error) return false;
    return this.form.dirty;
  }

  discardKind(): DiscardKind {
    return this.isDetail ? 'edit' : 'create';
  }

  protected error(key: AmountKey | 'name', label: string): string | null {
    this.formVersion();
    const control = this.form.controls[key];
    if (!control.touched || control.valid) return null;
    return control.hasError('required') ? `${label} is required.` : 'Enter a valid amount, e.g. 1,500.00.';
  }

  private amounts(): ExpenseAmounts {
    const value = this.form.getRawValue();
    return {
      electricity: parseAmount(value.electricity) ?? 0,
      payroll: parseAmount(value.payroll) ?? 0,
      water: parseAmount(value.water) ?? 0,
      maintenance: parseAmount(value.maintenance) ?? 0,
    };
  }

  private bump(): void {
    this.formVersion.update((v) => v + 1);
  }

  private fill(report: ExpenseReportDetail): void {
    const money = (n: number) => n.toFixed(2);
    this.form.setValue({
      name: report.name,
      electricity: money(report.expenses.electricity),
      payroll: money(report.expenses.payroll),
      water: money(report.expenses.water),
      maintenance: money(report.expenses.maintenance),
    });
    this.form.markAsPristine();
    this.bump();
  }
}
