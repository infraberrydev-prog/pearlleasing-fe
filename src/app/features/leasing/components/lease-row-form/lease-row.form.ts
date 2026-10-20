import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AMOUNT_PATTERN as AMOUNT, parseAmount } from '../../../../shared/utils/amount';
import { LeaseRow, PaymentStatus, rowTotal } from '../../models/leasing-report';

export { parseAmount };

const MOBILE = /^[+\d][\d\s-]{6,17}$/;

const formatAmount = (value: number | null) => (value === null ? '' : value.toFixed(2));

const text = (value = '', validators: ValidatorFn[] = []) =>
  new FormControl(value, { nonNullable: true, validators });
const amount = (value: number | null, required: boolean) =>
  text(formatAmount(value), required ? [Validators.required, Validators.pattern(AMOUNT)] : [Validators.pattern(AMOUNT)]);

export function createRowForm(row?: LeaseRow) {
  return new FormGroup({
    // Not a field: carries the saved row id so updates go to the right row.
    id: new FormControl<number | null>(row?.id ?? null),
    buildingType: text(row?.buildingType, [Validators.required]),
    vendor: text(row?.vendor, [Validators.required]),
    stall: text(row?.stall, [Validators.required]),
    lesseeName: text(row?.lesseeName, [Validators.required]),
    mobileNumber: text(row?.mobileNumber ?? '', [Validators.pattern(MOBILE)]),
    tin: text(row?.tin ?? ''),
    monthlyRental: amount(row?.monthlyRental ?? null, true),
    paymentStatus: text(row?.paymentStatus ?? '', [Validators.required]),
    paymentMethod: text(row?.paymentMethod, [Validators.required]),
    referenceNumber: text(row?.referenceNumber, [Validators.required]),
    electricity: amount(row?.electricity ?? null, true),
    water: amount(row?.water ?? null, true),
    otherUtilities: amount(row?.otherUtilities ?? null, true),
    cusaFee: amount(row?.cusaFee ?? null, false),
    pylonRental: amount(row?.pylonRental ?? null, false),
    penalty: amount(row?.penalty ?? null, false),
  });
}

export type LeaseRowForm = ReturnType<typeof createRowForm>;
export type LeaseRowValue = ReturnType<LeaseRowForm['getRawValue']>;

/** Total for the live form value; unparseable or empty amounts count as 0. */
export function totalOf(value: LeaseRowValue): number {
  const n = (t: string) => parseAmount(t) ?? 0;
  return rowTotal({
    monthlyRental: n(value.monthlyRental),
    electricity: n(value.electricity),
    water: n(value.water),
    otherUtilities: n(value.otherUtilities),
    cusaFee: n(value.cusaFee),
    pylonRental: n(value.pylonRental),
    penalty: n(value.penalty),
  });
}

/** Form value → saved row. Call only on a valid form. */
export function toLeaseRow(value: LeaseRowValue): LeaseRow {
  const optional = (t: string) => (t.trim() === '' ? null : t.trim());
  return {
    ...(value.id === null ? {} : { id: value.id }),
    buildingType: value.buildingType.trim(),
    vendor: value.vendor.trim(),
    stall: value.stall.trim(),
    lesseeName: value.lesseeName.trim(),
    mobileNumber: optional(value.mobileNumber),
    tin: optional(value.tin),
    monthlyRental: parseAmount(value.monthlyRental) ?? 0,
    paymentStatus: value.paymentStatus as PaymentStatus,
    paymentMethod: value.paymentMethod,
    referenceNumber: value.referenceNumber.trim(),
    electricity: parseAmount(value.electricity) ?? 0,
    water: parseAmount(value.water) ?? 0,
    otherUtilities: parseAmount(value.otherUtilities) ?? 0,
    cusaFee: parseAmount(value.cusaFee),
    pylonRental: parseAmount(value.pylonRental),
    penalty: parseAmount(value.penalty),
  };
}

/** Message for a field that has been touched and is invalid. */
export function fieldError(control: FormControl<string>, label: string): string | null {
  if (!control.touched || control.valid) return null;
  if (control.hasError('required')) return `${label} is required.`;
  if (control.hasError('pattern')) {
    return label.startsWith('Mobile') ? 'Enter a valid mobile number.' : 'Enter a valid amount, e.g. 1,500.00.';
  }
  return null;
}
