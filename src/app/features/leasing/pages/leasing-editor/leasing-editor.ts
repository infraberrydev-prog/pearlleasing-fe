import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Alert, Button, ConfirmDialogService, Divider, Icon, InputField } from '../../../../shared/ui';
import { HasUnsavedChanges, confirmDiscard } from '../../../../shared/utils/unsaved-changes.guard';
import { LeaseRowFormComponent, LookupListIds } from '../../components/lease-row-form/lease-row-form';
import { LeaseRowForm, createRowForm, toLeaseRow } from '../../components/lease-row-form/lease-row.form';
import { LeasingReportDetail } from '../../models/leasing-report';
import { leasingEditorActions } from '../../store/leasing.actions';
import { leasingFeature } from '../../store/leasing.feature';

/**
 * Create / edit a leasing report (Figma 315:6645 empty, 315:6937 row expanded,
 * 308:3133 filled, 316:7921 discard). `/leasing/new` creates; `/leasing/:id/edit` edits.
 */
@Component({
  selector: 'app-leasing-editor',
  imports: [ReactiveFormsModule, Alert, Button, Divider, Icon, InputField, LeaseRowFormComponent],
  templateUrl: './leasing-editor.html',
  styleUrl: './leasing-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeasingEditor implements HasUnsavedChanges {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly isEdit = this.id !== null;

  protected readonly editor = this.store.selectSignal(leasingFeature.selectEditor);
  protected readonly lookups = this.store.selectSignal(leasingFeature.selectLookups);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rows: new FormArray<LeaseRowForm>([createRowForm()]),
  });

  /** Expanded rows, by form instance so the state follows a row when others are removed. */
  protected readonly expanded = signal(new Set<LeaseRowForm>(this.isEdit ? [] : [this.form.controls.rows.at(0)]));
  /** Bumps on every form change so totals and the Submit state re-evaluate. */
  private readonly formVersion = signal(0);
  protected readonly canSubmit = computed(() => {
    this.formVersion();
    return this.form.valid && !this.editor().saving && !(this.isEdit && !this.editor().report);
  });
  private submitted = false;

  protected readonly listIds: LookupListIds = {
    buildingTypes: 'leasing-building-types',
    vendors: 'leasing-vendors',
    stalls: 'leasing-stalls',
  };

  constructor() {
    this.store.dispatch(leasingEditorActions.opened({ id: this.id }));
    this.form.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.formVersion.update((v) => v + 1));
    this.form.statusChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.formVersion.update((v) => v + 1));

    // Edit mode: fill the form once the report arrives.
    effect(() => {
      const report = this.editor().report;
      if (report && this.isEdit) this.fill(report);
    });
  }

  protected get rows(): FormArray<LeaseRowForm> {
    return this.form.controls.rows;
  }

  protected isExpanded(row: LeaseRowForm): boolean {
    return this.expanded().has(row);
  }

  protected setExpanded(row: LeaseRowForm, open: boolean): void {
    const next = new Set(this.expanded());
    if (open) next.add(row);
    else next.delete(row);
    this.expanded.set(next);
  }

  protected addRow(): void {
    const row = createRowForm();
    this.rows.push(row);
    this.setExpanded(row, true);
    this.focusRow(this.rows.length - 1);
  }

  protected duplicateRow(index: number): void {
    const copy = createRowForm();
    copy.setValue(this.rows.at(index).getRawValue());
    this.rows.insert(index + 1, copy);
    this.setExpanded(copy, true);
    this.focusRow(index + 1);
  }

  protected removeRow(index: number): void {
    this.confirmDialog
      .confirm({
        title: 'Are you sure you want to delete this row?',
        message: 'The lessee details entered in this row will be removed from the report.',
        tone: 'danger',
        cancelLabel: 'Cancel',
        confirmLabel: 'Delete',
        confirmVariant: 'danger',
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.setExpanded(this.rows.at(index), false);
        this.rows.removeAt(index);
        this.form.markAsDirty();
      });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Open every row that still has a problem.
      const next = new Set(this.expanded());
      this.rows.controls.filter((row) => row.invalid).forEach((row) => next.add(row));
      this.expanded.set(next);
      this.formVersion.update((v) => v + 1);
      return;
    }
    const { name } = this.form.getRawValue();
    this.submitted = true;
    this.store.dispatch(
      leasingEditorActions.submitted({
        id: this.id,
        draft: { name: name.trim(), rows: this.rows.controls.map((row) => toLeaseRow(row.getRawValue())) },
      }),
    );
  }

  /** Discard button and the back arrow. The route guard asks if there are edits. */
  protected leave(): void {
    this.router.navigateByUrl(this.isEdit ? `/leasing/${this.id}` : '/leasing');
  }

  protected discard(): void {
    if (!this.form.dirty) {
      this.leave();
      return;
    }
    confirmDiscard(this.confirmDialog).subscribe((leave) => {
      if (!leave) return;
      this.form.markAsPristine();
      this.leave();
    });
  }

  hasUnsavedChanges(): boolean {
    // A failed save keeps the edits; a successful one navigates away.
    if (this.submitted && !this.editor().error) return false;
    return this.form.dirty;
  }

  protected nameError(): string | null {
    this.formVersion();
    const control = this.form.controls.name;
    return control.touched && control.invalid ? 'Report Name is required.' : null;
  }

  private fill(report: LeasingReportDetail): void {
    this.rows.clear({ emitEvent: false });
    report.rows.forEach((row) => this.rows.push(createRowForm(row), { emitEvent: false }));
    this.form.controls.name.setValue(report.name);
    this.form.markAsPristine();
    this.expanded.set(new Set());
  }

  private focusRow(index: number): void {
    // After the new row renders, move focus to its first field.
    setTimeout(() => {
      const rows = this.host.nativeElement.querySelectorAll('app-lease-row-form');
      rows[index]?.querySelector<HTMLInputElement>('.body input')?.focus();
    });
  }
}
