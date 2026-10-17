import { LeaseRow, reportTotal, rowTotal } from '../../models/leasing-report';
import { createRowForm, parseAmount, toLeaseRow, totalOf } from './lease-row.form';

const ROW: LeaseRow = {
  buildingType: 'Pearl Plaza',
  vendor: 'J&C Supplies',
  stall: 'A-01',
  lesseeName: 'John Martial',
  mobileNumber: null,
  tin: null,
  monthlyRental: 2500,
  paymentStatus: 'unpaid',
  paymentMethod: 'Cash',
  referenceNumber: 'REF-1',
  electricity: 500,
  water: 300,
  otherUtilities: 200,
  cusaFee: 100,
  pylonRental: null,
  penalty: 100,
};

describe('lease row helpers', () => {
  it('parses typed amounts', () => {
    expect(parseAmount('1,500.50')).toBe(1500.5);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });

  it('totals rental + utilities − deductions', () => {
    // 2500 + 500 + 300 + 200 + 100 − 100
    expect(rowTotal(ROW)).toBe(3500);
    expect(reportTotal([ROW, ROW])).toBe(7000);
  });

  it('round-trips a row through the form', () => {
    const form = createRowForm(ROW);
    expect(form.valid).toBe(true);
    expect(form.controls.monthlyRental.value).toBe('2500.00');
    expect(totalOf(form.getRawValue())).toBe(3500);
    expect(toLeaseRow(form.getRawValue())).toEqual(ROW);
  });

  it('requires the starred fields and checks amounts', () => {
    const form = createRowForm();
    expect(form.valid).toBe(false);
    expect(form.controls.mobileNumber.valid).toBe(true);
    form.controls.monthlyRental.setValue('12abc');
    expect(form.controls.monthlyRental.hasError('pattern')).toBe(true);
    form.controls.monthlyRental.setValue('12,000.50');
    expect(form.controls.monthlyRental.valid).toBe(true);
  });
});
