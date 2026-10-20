import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { formatPeso } from '../../../../shared/pipes/format.pipes';
import { Chip, Icon, InputField, SelectField, SelectOption } from '../../../../shared/ui';
import { LeasingLookups } from '../../models/leasing-report';
import { LeaseRowForm, fieldError, totalOf } from './lease-row.form';

export const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
];

/** Ids of the editor's shared <datalist> elements for the searchable fields. */
export interface LookupListIds {
  buildingTypes: string;
  vendors: string;
  stalls: string;
}

/**
 * One lessee row of a leasing report (Figma 315:6937): an accordion whose header reads
 * "Row 1 - Building Type / Vendor Name or Category / Lessee Name / Total Amount: ₱ 3,500.00",
 * with edit, duplicate and delete buttons. Expanded, it shows Lessee Information,
 * Rental Payment, Utilities and Deductions, then the row's Total Amount.
 */
@Component({
  selector: 'app-lease-row-form',
  imports: [ReactiveFormsModule, Chip, Icon, InputField, SelectField],
  templateUrl: './lease-row-form.html',
  styleUrl: './lease-row-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-expanded]': 'expanded()', '[class.has-errors]': 'showErrorBadge()' },
})
export class LeaseRowFormComponent {
  readonly form = input.required<LeaseRowForm>();
  /** 0-based position; shown as "Row 1". */
  readonly index = input.required<number>();
  readonly lookups = input<LeasingLookups | null>(null);
  readonly listIds = input.required<LookupListIds>();
  readonly expanded = model(false);
  readonly canRemove = input(true, { transform: booleanAttribute });
  /** Edit / duplicate / delete buttons (create form). The detail page hides them. */
  readonly showTools = input(true, { transform: booleanAttribute });
  /** Only the delete button (detail page: the API deletes single rows; not in Figma). */
  readonly showDelete = input(false, { transform: booleanAttribute });
  /** Unpaid / Paid chip before the row label (detail page, Figma 238:2740). */
  readonly showStatus = input(false, { transform: booleanAttribute });
  readonly duplicate = output<void>();
  readonly remove = output<void>();

  protected readonly statusOptions = PAYMENT_STATUS_OPTIONS;

  protected paymentMethodOptions(): SelectOption[] {
    return (this.lookups()?.paymentMethods ?? []).map((m) => ({ value: m, label: m }));
  }

  protected summary(): string {
    const v = this.form().getRawValue();
    const part = (value: string, fallback: string) => value.trim() || fallback;
    return [
      part(v.buildingType, 'Building Type'),
      part(v.vendor, 'Vendor Name or Category'),
      part(v.lesseeName, 'Lessee Name'),
      `Total Amount: ${this.total()}`,
    ].join(' / ');
  }

  /** Follows the Payment Status field live, so Unpaid → Paid shows at once. */
  protected status(): 'unpaid' | 'paid' | null {
    const value = this.form().controls.paymentStatus.value;
    return value === 'paid' || value === 'unpaid' ? value : null;
  }

  protected total(): string {
    return formatPeso(totalOf(this.form().getRawValue()));
  }

  protected error(name: Exclude<keyof LeaseRowForm['controls'], 'id'>, label: string): string | null {
    return fieldError(this.form().controls[name], label);
  }

  /** Collapsed rows with invalid, touched fields get a red outline so they aren't missed. */
  protected showErrorBadge(): boolean {
    return !this.expanded() && this.form().touched && this.form().invalid;
  }
}
