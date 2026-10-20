import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { PesoPipe, ReportDatePipe } from '../../../../shared/pipes/format.pipes';
import { Alert, CellDef, Chip, DataTable, DialogShell, Pagination, TableColumn } from '../../../../shared/ui';
import { LeasingApi } from '../../data/leasing-api';
import { LeaseRow, rowTotal } from '../../models/leasing-report';

export interface ReportRowsDialogData {
  id: string;
}

interface RowView extends LeaseRow {
  key: number;
  total: number;
}

const PAGE_SIZE = 10;

const COLUMNS: readonly TableColumn[] = [
  { key: 'buildingType', header: 'Building Type', width: '150px' },
  { key: 'vendor', header: 'Vendor Name / Category', width: '190px' },
  { key: 'stall', header: 'Stall', width: '90px' },
  { key: 'lesseeName', header: 'Lessee Name', width: '170px' },
  { key: 'mobileNumber', header: 'Mobile No.', width: '150px' },
  { key: 'tin', header: 'TIN No.', width: '130px' },
  { key: 'monthlyRental', header: 'Monthly Rental', align: 'end', width: '140px' },
  { key: 'paymentStatus', header: 'Payment Status', width: '140px' },
  { key: 'paymentMethod', header: 'Payment Method', width: '150px' },
  { key: 'referenceNumber', header: 'Reference No.', width: '160px' },
  { key: 'electricity', header: 'Electricity', align: 'end', width: '120px' },
  { key: 'water', header: 'Water', align: 'end', width: '120px' },
  { key: 'otherUtilities', header: 'Other Utilities', align: 'end', width: '140px' },
  { key: 'cusaFee', header: 'CUSA Fee', align: 'end', width: '120px' },
  { key: 'pylonRental', header: 'Pylon Rental', align: 'end', width: '130px' },
  { key: 'penalty', header: '10% Penalty', align: 'end', width: '130px' },
  { key: 'total', header: 'Total Amount', align: 'end', width: '140px' },
];

const AMOUNT_KEYS = ['monthlyRental', 'electricity', 'water', 'otherUtilities', 'cusaFee', 'pylonRental', 'penalty', 'total'] as const;
const TEXT_KEYS = ['buildingType', 'vendor', 'stall', 'lesseeName', 'mobileNumber', 'tin', 'paymentMethod', 'referenceNumber'] as const;

/**
 * Read-only view of a report's rows, opened from the eye icon on the list (Figma "Modal" 367:15479).
 * Loads GET /api/reports/{id}/details; ten rows per page. Editing happens on the detail page.
 */
@Component({
  selector: 'app-report-rows-dialog',
  imports: [Alert, CellDef, Chip, DataTable, DialogShell, Pagination, PesoPipe, ReportDatePipe],
  templateUrl: './report-rows-dialog.html',
  styleUrl: './report-rows-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportRowsDialog {
  protected readonly ref = inject(DialogRef);
  private readonly data = inject<ReportRowsDialogData>(DIALOG_DATA);
  private readonly api = inject(LeasingApi);

  protected readonly columns = COLUMNS;
  protected readonly amountKeys = AMOUNT_KEYS;
  protected readonly textKeys = TEXT_KEYS;
  protected readonly page = signal(1);

  protected readonly report = rxResource({
    params: () => this.data.id,
    stream: ({ params: id }) => this.api.get(id),
  });

  /** The loaded report, or undefined while loading or after an error (reading value() then throws). */
  protected readonly loaded = computed(() => (this.report.hasValue() ? this.report.value() : undefined));

  private readonly rows = computed<RowView[]>(() =>
    (this.loaded()?.rows ?? []).map((row, index) => ({ ...row, key: row.id ?? index, total: rowTotal(row) })),
  );
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.rows().length / PAGE_SIZE)));
  protected readonly pageRows = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.rows().slice(start, start + PAGE_SIZE);
  });
  protected readonly rowKey = (row: RowView) => row.key;

  protected readonly errorMessage = computed(() => {
    const error = this.report.error();
    return error instanceof Error ? error.message : 'The report could not be loaded.';
  });
}
