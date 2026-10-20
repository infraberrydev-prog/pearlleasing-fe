export type PaymentStatus = 'unpaid' | 'paid';

/** One lessee line of a leasing report (Figma create form 315:6937). */
export interface LeaseRow {
  /** Server row id; absent on rows that were never saved. */
  id?: number;
  // Lessee Information
  buildingType: string;
  vendor: string;
  stall: string;
  lesseeName: string;
  mobileNumber: string | null;
  tin: string | null;
  // Rental Payment
  monthlyRental: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  referenceNumber: string;
  // Utilities
  electricity: number;
  water: number;
  otherUtilities: number;
  cusaFee: number | null;
  pylonRental: number | null;
  // Deductions
  penalty: number | null;
}

export interface LeasingReportDraft {
  name: string;
  rows: LeaseRow[];
}

export interface LeasingReportDetail extends LeasingReportDraft {
  id: string;
  createdAt: string;
  updatedAt: string | null;
}

/** Choices for the searchable and dropdown fields. */
export interface LeasingLookups {
  buildingTypes: string[];
  vendors: string[];
  stalls: string[];
  paymentMethods: string[];
}

/**
 * Row total = monthly rental + utilities − deductions.
 * The 10% Penalty sits under "Deductions" in Figma, so it is subtracted (to confirm with the client).
 */
export function rowTotal(row: Pick<LeaseRow,
  'monthlyRental' | 'electricity' | 'water' | 'otherUtilities' | 'cusaFee' | 'pylonRental' | 'penalty'
>): number {
  const add =
    row.monthlyRental + row.electricity + row.water + row.otherUtilities + (row.cusaFee ?? 0) + (row.pylonRental ?? 0);
  return round2(add - (row.penalty ?? 0));
}

/** Report total ("Expected Revenue" in the list). */
export function reportTotal(rows: readonly LeaseRow[]): number {
  return round2(rows.reduce((sum, row) => sum + rowTotal(row), 0));
}

const round2 = (n: number) => Math.round(n * 100) / 100;
