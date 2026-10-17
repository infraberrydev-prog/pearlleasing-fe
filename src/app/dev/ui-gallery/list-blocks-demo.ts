import { ChangeDetectionStrategy, Component, TemplateRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { DialogRef } from '@angular/cdk/dialog';
import {
  BottomSheet,
  Button,
  CellDef,
  DataTable,
  DateRange,
  DateRangeCalendar,
  DropdownPanel,
  EmptyState,
  FilterButton,
  FilterButtonGroup,
  Icon,
  InputField,
  Menu,
  MenuItem,
  Option,
  OptionList,
  Pagination,
  PanelActions,
  PanelSection,
  TableColumn,
} from '../../shared/ui';

interface DemoReport {
  id: string;
  name: string;
  revenue: string;
  created: string;
  updated: string;
}

const ROWS: DemoReport[] = Array.from({ length: 8 }, (_, i) => ({
  id: `RP2523${i}`,
  name: 'Report for Month of January',
  revenue: i === 0 ? '₱ 100,500.00' : '₱ 2,500.00',
  created: 'Jan 8, 2025 - 08:30:22',
  updated: '—',
}));

/** Step 5 building blocks, arranged like the Figma report list (435:11353). */
@Component({
  selector: 'app-list-blocks-demo',
  imports: [
    ReactiveFormsModule,
    CdkMenuTrigger,
    Button,
    CellDef,
    DataTable,
    DateRangeCalendar,
    DropdownPanel,
    EmptyState,
    FilterButton,
    FilterButtonGroup,
    Icon,
    InputField,
    Menu,
    MenuItem,
    OptionList,
    Pagination,
    PanelActions,
    PanelSection,
  ],
  templateUrl: './list-blocks-demo.html',
  styleUrl: './ui-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListBlocksDemo {
  private readonly bottomSheet = inject(BottomSheet);

  protected readonly columns: TableColumn[] = [
    { key: 'id', header: 'Report ID', width: '108px' },
    { key: 'name', header: 'Report Name' },
    { key: 'revenue', header: 'Expected Revenue', align: 'end', width: '190px' },
    { key: 'created', header: 'Date & Time Created', width: '240px' },
    { key: 'updated', header: 'Last Updated', width: '240px' },
    { key: 'actions', header: 'Actions', align: 'center', width: '120px' },
  ];
  protected readonly rows = ROWS;
  protected readonly selected = signal<readonly unknown[]>([]);
  protected readonly page = signal(1);
  protected readonly lastAction = signal('—');

  protected readonly sortOptions: Option<string>[] = [
    { value: 'revenue-desc', label: 'Expected Revenue: Highest first' },
    { value: 'revenue-asc', label: 'Expected Revenue: Lowest first' },
    { value: 'created-desc', label: 'Date Created: Newest first' },
    { value: 'created-asc', label: 'Date Created: Oldest first' },
    { value: 'updated-desc', label: 'Last Updated: Newest first' },
    { value: 'updated-asc', label: 'Last Updated: Oldest first' },
  ];
  protected readonly sort = new FormControl<string | null>(null);
  protected readonly sortOpen = signal(false);
  protected readonly filterOpen = signal(false);
  protected readonly range = new FormControl<DateRange>({ start: null, end: null });

  protected openSheet(template: TemplateRef<unknown>): DialogRef {
    return this.bottomSheet.open(template, { ariaLabel: 'Date range' });
  }

  protected formatRange(value: DateRange | null): string {
    const fmt = (d: Date | null) => (d ? d.toDateString() : '…');
    return value?.start ? `${fmt(value.start)} → ${fmt(value.end)}` : 'none';
  }
}
