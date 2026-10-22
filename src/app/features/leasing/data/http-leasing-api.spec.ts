import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config';
import { DEFAULT_QUERY } from '../../reports/models/report';
import { LeaseRow } from '../models/leasing-report';
import { numericId } from '../../../shared/utils/api';
import { HttpLeasingApi } from './http-leasing-api';

const LIST = {
  data: [
    { id: 4, reportId: 'RP00004', reportName: 'March', totalExpenses: 9500, dateTimeCreated: '2026-10-18T14:29:13.61', lastDateUpdated: null },
    { id: 3, reportId: 'RP00003', reportName: 'February', expectedCashRevenue: 100, dateTimeCreated: '2026-10-17T14:29:13', lastDateUpdated: '2026-10-19T01:00:00' },
  ],
  totalRecords: 2,
  currentPage: 1,
  totalPages: 1,
  pageSize: 1000,
};

const ROW_DTO = {
  id: 7,
  buildingType: 'Building - A',
  vendorNameOrCategory: 'Dry Section',
  stallUnit: 'A-1',
  lesseeName: 'John Santos',
  mobileNo: '09171234527',
  tinNo: '',
  monthlyRental: 2500,
  paymentStatus: 'Unpaid',
  paymentMethod: 'Gcash',
  referenceNo: 'RF1',
  electricity: 500,
  water: 200,
  otherUtilities: 300,
  cusaFee: null,
  pylonRental: null,
  penaltyTenPercent: 0,
};

const DETAILS = { reportId: 'RP00004', reportName: 'March', totalRevenue: 3500, dateCreated: '2026-10-18T14:29:13', rowData: [ROW_DTO] };

let http: HttpTestingController | null = null;

function setup() {
  TestBed.configureTestingModule({
    providers: [HttpLeasingApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }],
  });
  http = TestBed.inject(HttpTestingController);
  return { api: TestBed.inject(HttpLeasingApi), http };
}

/** Answers the master-data calls: one building ("Building - A") with stall A-1 (id 1). */
function flushDirectory(http: HttpTestingController) {
  http.expectOne('/api/master-data/buildings').flush([{ id: 1, name: 'Building - A' }]);
  http.expectOne('/api/master-data/vendors').flush([{ id: 1, name: 'Dry Section' }]);
  http.expectOne('/api/master-data/stalls/by-building/1').flush([{ id: 1, unitNumber: 'A-1', isOccupied: false }]);
}

const detailsUrl = (id: number) => (req: { url: string }) => req.url === `/api/reports/${id}/details`;

describe('HttpLeasingApi', () => {
  afterEach(() => {
    http?.verify();
    http = null;
  });

  it('reads the numeric id from a formatted report id', () => {
    expect(numericId('RP00004')).toBe(4);
    expect(numericId('12')).toBe(12);
    expect(() => numericId('abc')).toThrow();
  });

  it('lists every report and searches, sorts and pages locally', async () => {
    const { api, http } = setup();
    const page = firstValueFrom(api.list({ ...DEFAULT_QUERY, search: 'feb' }));
    const req = http.expectOne((r) => r.url === '/api/reports/get-all-reports');
    expect(req.request.params.get('pageSize')).toBe('100');
    req.flush(LIST);

    expect(await page).toEqual({
      items: [{ id: 'RP00003', name: 'February', amount: 100, createdAt: '2026-10-17T14:29:13Z', updatedAt: '2026-10-19T01:00:00Z' }],
      total: 1,
      grandTotal: 2,
    });
  });

  it('reuses the loaded list for searching and reloads it on refresh', async () => {
    const { api, http } = setup();
    const first = firstValueFrom(api.list(DEFAULT_QUERY, true));
    http.expectOne((r) => r.url === '/api/reports/get-all-reports').flush(LIST);
    expect((await first).total).toBe(2);

    // Typing a search makes no request.
    expect((await firstValueFrom(api.list({ ...DEFAULT_QUERY, search: 'march' }))).total).toBe(1);
    http.expectNone((r) => r.url === '/api/reports/get-all-reports');

    const reloaded = firstValueFrom(api.list(DEFAULT_QUERY, true));
    http.expectOne((r) => r.url === '/api/reports/get-all-reports').flush({ ...LIST, data: LIST.data.slice(0, 1) });
    expect((await reloaded).total).toBe(1);
  });

  it('maps report details, treating server times as UTC', async () => {
    const { api, http } = setup();
    const report = firstValueFrom(api.get('RP00004'));
    http.expectOne(detailsUrl(4)).flush(DETAILS);

    const result = await report;
    expect(result).toMatchObject({ id: 'RP00004', name: 'March', createdAt: '2026-10-18T14:29:13Z' });
    expect(result.rows[0]).toMatchObject({ id: 7, vendor: 'Dry Section', stall: 'A-1', paymentStatus: 'unpaid', tin: null, penalty: null });
  });

  it('shows the server message when a report is missing', async () => {
    const { api, http } = setup();
    const report = firstValueFrom(api.get('RP00009'));
    http.expectOne(detailsUrl(9)).flush('Report with ID 9 does not exist.', { status: 404, statusText: 'Not Found' });
    await expect(report).rejects.toThrow('Report with ID 9 does not exist.');
  });

  it('builds lookups from master data', async () => {
    const { api, http } = setup();
    const lookups = firstValueFrom(api.lookups());
    flushDirectory(http);
    expect(await lookups).toMatchObject({ buildingTypes: ['Building - A'], vendors: ['Dry Section'], stalls: ['A-1'] });
  });

  it('updates changed rows, adds new ones and deletes removed ones', async () => {
    const { api, http } = setup();
    const kept: LeaseRow = { id: 7, buildingType: 'Building - A', vendor: 'Dry Section', stall: 'A-1', lesseeName: 'John Santos', mobileNumber: null, tin: null, monthlyRental: 2500, paymentStatus: 'paid', paymentMethod: 'Gcash', referenceNumber: 'RF1', electricity: 500, water: 200, otherUtilities: 300, cusaFee: null, pylonRental: null, penalty: null };
    const added: LeaseRow = { ...kept, id: undefined, lesseeName: 'New Lessee' };
    delete added.id;
    const saved = firstValueFrom(api.update('RP00004', { name: 'March', rows: [kept, added] }));

    http.expectOne(detailsUrl(4)).flush({ ...DETAILS, rowData: [ROW_DTO, { ...ROW_DTO, id: 8 }] });
    flushDirectory(http);

    const update = http.expectOne('/api/reports/update-report');
    expect(update.request.body).toEqual([expect.objectContaining({ id: 7, buildingId: 1, stallUnitId: 1, paymentStatus: 'Paid' })]);
    update.flush({ message: 'ok' });
    const add = http.expectOne('/api/reports/4/rows/add');
    expect(add.request.body).toMatchObject({ nameOfLessee: 'New Lessee', stallUnitId: 1 });
    add.flush({ message: 'ok', newRowId: 9 });
    http.expectOne('/api/reports/rows/delete/8').flush({ message: 'ok' });

    http.expectOne(detailsUrl(4)).flush(DETAILS);
    expect((await saved).id).toBe('RP00004');
  });

  it('renames the report through the row update', async () => {
    const { api, http } = setup();
    const row: LeaseRow = { id: 7, buildingType: 'Building - A', vendor: 'Dry Section', stall: 'A-1', lesseeName: 'John Santos', mobileNumber: null, tin: null, monthlyRental: 2500, paymentStatus: 'unpaid', paymentMethod: 'Gcash', referenceNumber: 'RF1', electricity: 500, water: 200, otherUtilities: 300, cusaFee: null, pylonRental: null, penalty: null };
    const saved = firstValueFrom(api.update('RP00004', { name: 'April', rows: [row] }));
    http.expectOne(detailsUrl(4)).flush(DETAILS);
    flushDirectory(http);

    const update = http.expectOne('/api/reports/update-report');
    expect(update.request.body).toEqual([expect.objectContaining({ id: 7, reportName: 'April' })]);
    update.flush({ message: 'ok' });
    http.expectOne(detailsUrl(4)).flush({ ...DETAILS, reportName: 'April' });
    expect((await saved).name).toBe('April');
  });

  it('refuses a building that is not in the master data', async () => {
    const { api, http } = setup();
    const row = { buildingType: 'Nowhere', vendor: 'x', stall: 'A-1', lesseeName: 'x', mobileNumber: null, tin: null, monthlyRental: 1, paymentStatus: 'paid', paymentMethod: 'Cash', referenceNumber: 'r', electricity: 0, water: 0, otherUtilities: 0, cusaFee: null, pylonRental: null, penalty: null } as const;
    const created = firstValueFrom(api.create({ name: 'Test', rows: [row] }));
    flushDirectory(http);
    await expect(created).rejects.toThrow('Unknown building "Nowhere"');
  });

  it('reads the amount from either field name the server has used', async () => {
    const { api, http } = setup();
    const page = firstValueFrom(api.list(DEFAULT_QUERY));
    http.expectOne((r) => r.url === '/api/reports/get-all-reports').flush(LIST);
    // RP00004 sends totalExpenses, RP00003 the older expectedCashRevenue.
    expect((await page).items.map((r) => r.amount)).toEqual([9500, 100]);
  });

  it('loads every page when there are more than 100 reports', async () => {
    const { api, http } = setup();
    const page = firstValueFrom(api.list(DEFAULT_QUERY));
    const url = (r: { url: string }) => r.url === '/api/reports/get-all-reports';
    http.expectOne((r) => url(r) && r.params.get('page') === '1').flush({ ...LIST, totalPages: 2 });
    http.expectOne((r) => url(r) && r.params.get('page') === '2').flush({ ...LIST, data: [{ ...LIST.data[0], reportId: 'RP00099' }] });
    expect((await page).grandTotal).toBe(3);
  });

  it('deletes a report by its numeric id', async () => {
    const { api, http } = setup();
    const deleted = firstValueFrom(api.delete('RP00004'));
    http.expectOne('/api/reports/delete/4').flush({ message: 'ok' });
    await expect(deleted).resolves.toBeUndefined();
  });

  it('downloads the selected reports as one zip', async () => {
    const { api, http } = setup();
    const files = firstValueFrom(api.export(['RP00004', 'RP00003']));
    const req = http.expectOne('/api/reports/download');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reportIds: [4, 3] });
    req.flush(new Blob(['x']), { headers: new HttpHeaders({ 'Content-Disposition': "attachment; filename=leasing_reports.zip; filename*=UTF-8''leasing_reports.zip" }) });
    expect((await files).map((f) => f.fileName)).toEqual(['leasing_reports.zip']);
  });
});
