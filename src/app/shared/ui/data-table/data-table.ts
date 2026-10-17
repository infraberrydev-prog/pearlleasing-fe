import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Checkbox } from '../checkbox/checkbox';

export interface TableColumn {
  key: string;
  header: string;
  align?: 'start' | 'center' | 'end';
  /** CSS width, e.g. '190px'. Columns without one share the remaining space. */
  width?: string;
}

export interface CellContext<T> {
  $implicit: T;
  row: T;
}

/**
 * Custom cell content. Pass the table rows as `appCellRows` so `row` is typed:
 * `<ng-template appCell="reportId" [appCellRows]="rows" let-row>…</ng-template>`
 */
@Directive({ selector: 'ng-template[appCell]' })
export class CellDef<T = unknown> {
  readonly key = input.required<string>({ alias: 'appCell' });
  /** Only used to infer the row type in templates. */
  readonly rows = input<readonly T[] | undefined>(undefined, { alias: 'appCellRows' });
  readonly template = inject<TemplateRef<CellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: CellDef<T>, ctx: unknown): ctx is CellContext<T> {
    return true;
  }
}

/**
 * Figma report table (435:11379): bordered, 8px radius, 52px header and 68px rows,
 * Nunito 14/20 in neutral/gray-900. Optional checkbox column for row selection.
 * Scrolls horizontally when the viewport is narrower than the columns.
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, Checkbox],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T extends object> {
  readonly columns = input.required<readonly TableColumn[]>();
  readonly rows = input.required<readonly T[]>();
  /** Identifies a row for selection and tracking. */
  readonly rowKey = input<(row: T) => unknown>((row) => (row as { id?: unknown }).id);
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Keys of the selected rows. */
  readonly selected = model<readonly unknown[]>([]);
  /** Accessible name for the table. */
  readonly caption = input<string>();

  private readonly cellDefs = contentChildren(CellDef);
  protected readonly templates = computed(
    () => new Map(this.cellDefs().map((def) => [def.key(), def.template])),
  );

  private readonly selectedSet = computed(() => new Set(this.selected()));
  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.isSelected(row)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.isSelected(row)),
  );

  protected value(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  protected isSelected(row: T): boolean {
    return this.selectedSet().has(this.rowKey()(row));
  }

  protected toggleRow(row: T, checked: boolean): void {
    const key = this.rowKey()(row);
    const rest = this.selected().filter((k) => k !== key);
    this.selected.set(checked ? [...rest, key] : rest);
  }

  protected toggleAll(checked: boolean): void {
    const pageKeys = this.rows().map((row) => this.rowKey()(row));
    const others = this.selected().filter((k) => !pageKeys.includes(k));
    this.selected.set(checked ? [...others, ...pageKeys] : others);
  }
}
