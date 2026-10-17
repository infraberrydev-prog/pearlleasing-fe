import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import {
  Alert,
  BottomSheet,
  Button,
  ConfirmDialogService,
  Divider,
  DropdownPanel,
  FilterButton,
  Icon,
  InputField,
  Option,
  OptionList,
  Pagination,
  PanelActions,
} from '../../../../shared/ui';
import { DiscardKind, HasUnsavedChanges, confirmDiscard } from '../../../../shared/utils/unsaved-changes.guard';
import { LeaseRowFormComponent, LookupListIds } from '../../components/lease-row-form/lease-row-form';
import { LeaseRowForm, createRowForm, toLeaseRow } from '../../components/lease-row-form/lease-row.form';
import { LeasingReportDetail, PaymentStatus } from '../../models/leasing-report';
import { leasingEditorActions } from '../../store/leasing.actions';
import { leasingFeature } from '../../store/leasing.feature';

/** Figma detail page: ten rows per page (238:2740). */
const ROWS_PER_PAGE = 10;

/**
 * Leasing report form.
 * - Create (`/leasing/new`, Figma 315:6937): rows with edit / duplicate / delete, Discard + Submit Report.
 * - Detail (`/leasing/:id`, Figma 238:2740 / 311:4004): rows with Unpaid / Paid chips, search,
 *   sort by status, ten rows per page, Cancel + Update Report. Changing a row's Payment Status
 *   from Unpaid to Paid and pressing Update Report is the "Unpaid → Paid" flow.
 */
@Component({
  selector: 'app-leasing-editor',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    Alert,
    Button,
    Divider,
    DropdownPanel,
    FilterButton,
    Icon,
    InputField,
    LeaseRowFormComponent,
    OptionList,
    Pagination,
    PanelActions,
  ],
  templateUrl: './leasing-editor.html',
  // Shared with the expenses editor.
  styleUrl: '../../../reports/report-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeasingEditor implements HasUnsavedChanges {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly bottomSheet = inject(BottomSheet);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  /** Detail page of an existing report (otherwise the create form). */
  protected readonly isDetail = this.id !== null;

  protected readonly editor = this.store.selectSignal(leasingFeature.selectEditor);
  protected readonly lookups = this.store.selectSignal(leasingFeature.selectLookups);
  private readonly isMobile = toSignal(
    inject(BreakpointObserver).observe('(max-width: 767.98px)').pipe(map((s) => s.matches)),
    { initialValue: false },
  );

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rows: new FormArray<LeaseRowForm>([createRowForm()]),
  });

  /** Expanded rows, by form instance so the state follows a row when others move. */
  protected readonly expanded = signal(new Set<LeaseRowForm>(this.isDetail ? [] : [this.form.controls.rows.at(0)]));
  /** Bumps on every form change so derived values re-evaluate. */
  private readonly formVersion = signal(0);
  /**
   * Bumps only when rows are added, removed or loaded. The detail list re-sorts and re-filters
   * on this (and on search/sort changes), not on typing, so a row being edited stays in place,
   * e.g. it doesn't jump away when switched from Unpaid to Paid while "Unpaid first" is on.
   */
  private readonly rowsVersion = signal(0);
  private submitted = false;

  // Detail page toolbar
  protected readonly search = signal('');
  protected readonly statusSort = signal<PaymentStatus | null>(null);
  protected readonly statusSortDraft = new FormControl<PaymentStatus | null>(null);
  protected readonly sortOpen = signal(false);
  protected readonly page = signal(1);
  private sheetRef: DialogRef | null = null;
  protected readonly statusOptions: Option<PaymentStatus>[] = [
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'paid', label: 'Paid' },
  ];

  protected readonly title = computed(() => {
    if (!this.isDetail) return 'Create Report';
    const report = this.editor().report;
    return report ? `${report.id} - ${report.name}` : (this.id ?? '');
  });

  /** Rows after search and status sort, each with its position in the full list ("Row N"). */
  private readonly visibleRows = computed(() => {
    this.rowsVersion();
    const rows = this.form.controls.rows.controls.map((row, index) => ({ row, index }));
    if (!this.isDetail) return rows;
    const term = this.search().trim().toLowerCase();
    const matches = term
      ? rows.filter(({ row }) => {
          const { vendor, lesseeName } = row.getRawValue();
          return vendor.toLowerCase().includes(term) || lesseeName.toLowerCase().includes(term);
        })
      : rows;
    const first = this.statusSort();
    if (!first) return matches;
    // "Sort by Status": the chosen status first, original order kept within each group.
    const rank = ({ row }: { row: LeaseRowForm }) => (row.controls.paymentStatus.value === first ? 0 : 1);
    return [...matches].sort((a, b) => rank(a) - rank(b) || a.index - b.index);
  });

  protected readonly pageCount = computed(() =>
    this.isDetail ? Math.max(1, Math.ceil(this.visibleRows().length / ROWS_PER_PAGE)) : 1,
  );
  protected readonly pageRows = computed(() => {
    if (!this.isDetail) return this.visibleRows();
    const page = Math.min(this.page(), this.pageCount());
    return this.visibleRows().slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  });
  protected readonly visibleCount = computed(() => this.visibleRows().length);

  protected readonly canSubmit = computed(() => {
    this.formVersion();
    if (this.editor().saving) return false;
    // Update Report stays disabled until something changes (Figma 238:2740).
    if (this.isDetail) return !!this.editor().report && this.form.dirty && this.form.valid;
    return this.form.valid;
  });

  protected readonly listIds: LookupListIds = {
    buildingTypes: 'leasing-building-types',
    vendors: 'leasing-vendors',
    stalls: 'leasing-stalls',
  };

  constructor() {
    this.store.dispatch(leasingEditorActions.opened({ id: this.id }));
    const destroyRef = inject(DestroyRef);
    this.form.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.bump());
    this.form.statusChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.bump());

    // Detail page: fill the form once the report arrives.
    effect(() => {
      const report = this.editor().report;
      if (report && this.isDetail) this.fill(report);
    });
    // A new search or sort starts from the first page.
    effect(() => {
      this.search();
      this.statusSort();
      this.page.set(1);
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
    this.form.markAsDirty();
    this.rowsVersion.update((v) => v + 1);
    this.setExpanded(row, true);
    if (this.isDetail) {
      // Show the new row: clear the search and jump to the last page.
      this.search.set('');
      this.statusSort.set(null);
      queueMicrotask(() => this.page.set(this.pageCount()));
    }
    this.focusRow(row);
  }

  protected duplicateRow(index: number): void {
    const copy = createRowForm();
    copy.setValue(this.rows.at(index).getRawValue());
    this.rows.insert(index + 1, copy);
    this.form.markAsDirty();
    this.rowsVersion.update((v) => v + 1);
    this.setExpanded(copy, true);
    this.focusRow(copy);
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
        this.rowsVersion.update((v) => v + 1);
      });
  }

  // Status sort: dropdown on desktop/tablet, bottom sheet on mobile (Figma 346:9670).
  protected openSort(sheet: TemplateRef<unknown>): void {
    this.statusSortDraft.setValue(this.statusSort());
    if (this.isMobile()) this.sheetRef = this.bottomSheet.open(sheet, { ariaLabel: 'Sort by status' });
    else this.sortOpen.set(true);
  }

  protected applySort(value: PaymentStatus | null): void {
    this.statusSort.set(value);
    this.sortOpen.set(false);
    this.sheetRef?.close();
    this.sheetRef = null;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Open every row that still has a problem.
      const next = new Set(this.expanded());
      this.rows.controls.filter((row) => row.invalid).forEach((row) => next.add(row));
      this.expanded.set(next);
      this.bump();
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

  /** Back arrow. The route guard asks if there are edits. */
  protected leave(): void {
    this.router.navigateByUrl('/leasing');
  }

  /** Discard (create) / Cancel (detail). */
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
    // A failed save keeps the edits; a successful one navigates away.
    if (this.submitted && !this.editor().error) return false;
    return this.form.dirty;
  }

  discardKind(): DiscardKind {
    return this.isDetail ? 'edit' : 'create';
  }

  protected nameError(): string | null {
    this.formVersion();
    const control = this.form.controls.name;
    return control.touched && control.invalid ? 'Report Name is required.' : null;
  }

  private bump(): void {
    this.formVersion.update((v) => v + 1);
  }

  private fill(report: LeasingReportDetail): void {
    this.rows.clear({ emitEvent: false });
    report.rows.forEach((row) => this.rows.push(createRowForm(row), { emitEvent: false }));
    this.form.controls.name.setValue(report.name);
    this.form.markAsPristine();
    this.expanded.set(new Set());
    this.bump();
    this.rowsVersion.update((v) => v + 1);
  }

  private focusRow(row: LeaseRowForm): void {
    // After the row renders, move focus to its first field.
    setTimeout(() => {
      const index = this.pageRows().findIndex((item) => item.row === row);
      const rows = this.host.nativeElement.querySelectorAll('app-lease-row-form');
      const target = rows[index];
      target?.scrollIntoView?.({ block: 'nearest' });
      target?.querySelector<HTMLInputElement>('.body input')?.focus();
    });
  }
}
