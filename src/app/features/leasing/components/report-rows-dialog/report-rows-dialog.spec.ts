import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { LeasingApi } from '../../data/leasing-api';
import { LeaseRow, LeasingReportDetail } from '../../models/leasing-report';
import { ReportRowsDialog } from './report-rows-dialog';

const ROW: LeaseRow = {
  id: 1,
  buildingType: 'Building - A',
  vendor: 'Dry Section',
  stall: 'A-1',
  lesseeName: 'John Santos',
  mobileNumber: null,
  tin: null,
  monthlyRental: 2500,
  paymentStatus: 'unpaid',
  paymentMethod: 'Gcash',
  referenceNumber: 'RF1',
  electricity: 500,
  water: 200,
  otherUtilities: 300,
  cusaFee: null,
  pylonRental: null,
  penalty: null,
};

const report = (rows: number): LeasingReportDetail => ({
  id: 'RP00004',
  name: 'March 2027 Monthly Summary',
  createdAt: '2026-10-18T14:29:13Z',
  updatedAt: null,
  rows: Array.from({ length: rows }, (_, i) => ({ ...ROW, id: i + 1, lesseeName: `Lessee ${i + 1}` })),
});

function setup() {
  const response = new Subject<LeasingReportDetail>();
  const get = vi.fn(() => response);
  const close = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: LeasingApi, useValue: { get } },
      { provide: DIALOG_DATA, useValue: { id: 'RP00004' } },
      { provide: DialogRef, useValue: { close } },
    ],
  });
  const fixture = TestBed.createComponent(ReportRowsDialog);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const respond = async (value: LeasingReportDetail) => {
    response.next(value);
    response.complete();
    await fixture.whenStable();
  };
  return { fixture, el, get, close, response, respond };
}

describe('ReportRowsDialog', () => {
  it('loads the report rows by id and shows them read-only', async () => {
    const { el, get, respond } = setup();
    expect(get).toHaveBeenCalledWith('RP00004');
    expect(el.textContent).toContain('Loading rows');

    await respond(report(1));
    expect(el.querySelector('h2')!.textContent).toBe('March 2027 Monthly Summary');
    const cells = Array.from(el.querySelectorAll('tbody td')).map((td) => td.textContent!.trim());
    expect(cells).toEqual(expect.arrayContaining(['Building - A', 'Lessee 1', '₱ 2,500.00', 'Unpaid', '—']));
    // Total = 2,500 + 500 + 200 + 300.
    expect(cells.at(-1)).toBe('₱ 3,500.00');
    expect(el.querySelector('input, select')).toBeNull();
  });

  it('pages rows ten at a time', async () => {
    const { fixture, el, respond } = setup();
    await respond(report(23));
    expect(el.querySelectorAll('tbody tr').length).toBe(10);

    el.querySelector<HTMLButtonElement>('[aria-label="Page 3"]')!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('tbody tr').length).toBe(3);
    expect(el.querySelector('tbody')!.textContent).toContain('Lessee 21');
  });

  it('shows the server error', async () => {
    const { fixture, el, response } = setup();
    response.error(new Error('Report with ID 4 does not exist.'));
    await fixture.whenStable();
    expect(el.querySelector('app-alert')!.textContent).toContain('Report with ID 4 does not exist.');
  });

  it('closes with the X', () => {
    const { el, close } = setup();
    el.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click();
    expect(close).toHaveBeenCalled();
  });
});
