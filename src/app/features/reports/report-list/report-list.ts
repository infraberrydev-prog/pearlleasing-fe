import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DialogRef } from '@angular/cdk/dialog';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { PesoPipe, ReportDatePipe } from '../../../shared/pipes/format.pipes';
import {
  Alert,
  BottomSheet,
  Button,
  CellDef,
  ConfirmDialogService,
  DataTable,
  DropdownPanel,
  EmptyState,
  FilterButton,
  FilterButtonGroup,
  Icon,
  InputField,
  Pagination,
  TableColumn,
} from '../../../shared/ui';
import { ReportCard } from '../report-card/report-card';
import { ReportFilterPanel } from '../report-filter/report-filter';
import { ReportSortPanel } from '../report-sort/report-sort';
import {
  EMPTY_FILTER,
  ReportFilter,
  ReportListConfig,
  ReportQuery,
  ReportSort,
  ReportSummary,
  isFilterActive,
} from '../models/report';

type Layout = 'desktop' | 'tablet' | 'mobile';

/**
 * Report list shared by Leasing and Expenses (Figma 435:11353 desktop, 374:6491 tablet,
 * 361:13834 mobile). Presentational: the page passes data in and handles the outputs.
 * - States: loading, empty (no reports at all), no results (search/filter), data.
 * - Table on desktop; cards on tablet and mobile.
 * - Sort / Filter open as dropdowns on desktop and tablet, as bottom sheets on mobile.
 * - Delete and Download ask for confirmation first.
 */
@Component({
  selector: 'app-report-list',
  imports: [
    ReactiveFormsModule,
    PesoPipe,
    ReportDatePipe,
    Alert,
    Button,
    CellDef,
    DataTable,
    DropdownPanel,
    EmptyState,
    FilterButton,
    FilterButtonGroup,
    Icon,
    InputField,
    Pagination,
    ReportCard,
    ReportFilterPanel,
    ReportSortPanel,
  ],
  templateUrl: './report-list.html',
  styleUrl: './report-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportList {
  readonly config = input.required<ReportListConfig>();
  readonly reports = input.required<readonly ReportSummary[]>();
  readonly query = input.required<ReportQuery>();
  readonly total = input.required<number>();
  readonly grandTotal = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly loading = input(false);
  readonly loaded = input(false);
  readonly error = input<string | null>(null);

  readonly queryChange = output<Partial<ReportQuery>>();
  readonly view = output<string>();
  readonly create = output<void>();
  readonly deleteConfirmed = output<string>();
  readonly downloadConfirmed = output<readonly string[]>();

  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly bottomSheet = inject(BottomSheet);
  private sheetRef: DialogRef | null = null;

  protected readonly layout = toSignal(
    inject(BreakpointObserver)
      .observe(['(min-width: 1200px)', '(max-width: 767.98px)'])
      .pipe(
        map(({ breakpoints }): Layout =>
          breakpoints['(min-width: 1200px)']
            ? 'desktop'
            : breakpoints['(max-width: 767.98px)']
              ? 'mobile'
              : 'tablet',
        ),
      ),
    { initialValue: 'desktop' as Layout },
  );

  protected readonly columns = computed<TableColumn[]>(() => [
    { key: 'id', header: 'Report ID', width: '108px' },
    { key: 'name', header: 'Report Name' },
    { key: 'amount', header: this.config().amountLabel, align: 'end', width: '190px' },
    { key: 'createdAt', header: 'Date & Time Created', width: '240px' },
    { key: 'updatedAt', header: 'Last Updated', width: '240px' },
    { key: 'actions', header: 'Actions', align: 'center', width: '120px' },
  ]);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly selected = signal<readonly unknown[]>([]);
  protected readonly sortOpen = signal(false);
  protected readonly filterOpen = signal(false);

  protected readonly isEmpty = computed(() => this.loaded() && this.grandTotal() === 0);
  protected readonly noResults = computed(
    () => this.loaded() && this.grandTotal() > 0 && this.total() === 0,
  );
  protected readonly sortActive = computed(() => this.query().sort !== null);
  protected readonly filterActive = computed(() => isFilterActive(this.query().filter));

  constructor() {
    // Keep the box in sync when the query changes elsewhere (e.g. restored state).
    effect(() => {
      const search = this.query().search;
      if (search !== this.search.value) this.search.setValue(search, { emitEvent: false });
    });
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((search) => this.queryChange.emit({ search }));

    // Selection is per result set; drop it when the results change.
    effect(() => {
      this.query();
      this.selected.set([]);
    });
  }

  protected openSort(sheet: TemplateRef<unknown>): void {
    if (this.layout() === 'mobile') this.sheetRef = this.bottomSheet.open(sheet, { ariaLabel: 'Sort reports' });
    else this.sortOpen.set(true);
  }

  protected openFilter(sheet: TemplateRef<unknown>): void {
    if (this.layout() === 'mobile') this.sheetRef = this.bottomSheet.open(sheet, { ariaLabel: 'Filter reports' });
    else this.filterOpen.set(true);
  }

  protected applySort(sort: ReportSort | null): void {
    this.closePanels();
    this.queryChange.emit({ sort });
  }

  protected applyFilter(filter: ReportFilter): void {
    this.closePanels();
    this.queryChange.emit({ filter });
  }

  protected clearSearchAndFilters(): void {
    this.search.setValue('', { emitEvent: false });
    this.queryChange.emit({ search: '', filter: EMPTY_FILTER });
  }

  protected isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  protected setSelected(id: string, checked: boolean): void {
    const rest = this.selected().filter((key) => key !== id);
    this.selected.set(checked ? [...rest, id] : rest);
  }

  protected confirmDelete(report: ReportSummary): void {
    this.confirmDialog
      .confirm({
        title: 'Are you sure you want to delete report?',
        message:
          'This report and all related transaction details will be removed permanently. This action cannot be undone.',
        tone: 'danger',
        cancelLabel: 'Cancel',
        confirmLabel: 'Delete',
        confirmVariant: 'danger',
      })
      .subscribe((ok) => ok && this.deleteConfirmed.emit(report.id));
  }

  protected confirmDownload(): void {
    const ids = this.selected() as string[];
    const count = ids.length;
    this.confirmDialog
      .confirm({
        title: 'Download report',
        // Figma (920:15289) leaves the body as placeholder "Text".
        message: count
          ? `Download ${count} selected report${count === 1 ? '' : 's'} as a CSV file.`
          : 'Download all reports as a CSV file.',
        tone: 'primary',
        icon: 'download-01',
        cancelLabel: 'Cancel',
        confirmLabel: 'Download',
      })
      .subscribe((ok) => ok && this.downloadConfirmed.emit(ids));
  }

  private closePanels(): void {
    this.sortOpen.set(false);
    this.filterOpen.set(false);
    this.sheetRef?.close();
    this.sheetRef = null;
  }
}
