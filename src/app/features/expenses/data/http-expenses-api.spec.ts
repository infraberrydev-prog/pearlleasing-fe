import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config';
import { DEFAULT_QUERY } from '../../reports/models/report';
import { HttpExpensesApi } from './http-expenses-api';

const LIST = {
  data: [
    { id: 4, reportId: 'EP00004', reportName: 'October', totalExpenses: 5850, dateTimeCreated: '2026-10-21T09:03:07.06', lastDateUpdated: null },
    { id: 2, reportId: 'EP00002', reportName: 'September', totalExpenses: 7350, dateTimeCreated: '2026-10-21T08:46:20', lastDateUpdated: '2026-10-22T01:00:00' },
  ],
  totalRecords: 2,
  currentPage: 1,
  totalPages: 1,
  pageSize: 100,
};

const DETAILS = { reportId: '4', reportName: 'October', electricity: 0, payroll: 5000, water: 350, maintenanceExpenses: 500, totalAmount: 5850 };

const EXPENSES = { electricity: 100, payroll: 5000, water: 350, maintenance: 500 };

let http: HttpTestingController | null = null;

function setup() {
  TestBed.configureTestingModule({
    providers: [HttpExpensesApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }],
  });
  http = TestBed.inject(HttpTestingController);
  return { api: TestBed.inject(HttpExpensesApi), http };
}

const listUrl = (r: { url: string }) => r.url === '/api/expenses-reports/get-all-report';

describe('HttpExpensesApi', () => {
  afterEach(() => {
    http?.verify();
    http = null;
  });

  it('loads the list once and searches it locally', async () => {
    const { api, http } = setup();
    const first = firstValueFrom(api.list(DEFAULT_QUERY, true));
    const req = http.expectOne(listUrl);
    expect(req.request.params.get('pageSize')).toBe('100');
    req.flush(LIST);
    expect((await first).items[0]).toEqual({
      id: 'EP00004',
      name: 'October',
      amount: 5850,
      createdAt: '2026-10-21T09:03:07.06Z',
      updatedAt: null,
    });

    expect((await firstValueFrom(api.list({ ...DEFAULT_QUERY, search: 'sept' }))).total).toBe(1);
    http.expectNone(listUrl);
  });

  it('maps details, keeping the requested id and taking dates from the list', async () => {
    const { api, http } = setup();
    const report = firstValueFrom(api.get('EP00004'));
    http.expectOne('/api/expenses-reports/4/details').flush(DETAILS);
    http.expectOne(listUrl).flush(LIST);

    expect(await report).toEqual({
      id: 'EP00004',
      name: 'October',
      expenses: { electricity: 0, payroll: 5000, water: 350, maintenance: 500 },
      createdAt: '2026-10-21T09:03:07.06Z',
      updatedAt: null,
    });
  });

  it('shows the server message for a missing report', async () => {
    const { api, http } = setup();
    const report = firstValueFrom(api.get('EP00099'));
    http.expectOne('/api/expenses-reports/99/details').flush('Expense report with ID 99 does not exist.', { status: 404, statusText: 'Not Found' });
    await expect(report).rejects.toThrow('Expense report with ID 99 does not exist.');
  });

  it('creates a report with the API field names', async () => {
    const { api, http } = setup();
    const created = firstValueFrom(api.create({ name: 'November', expenses: EXPENSES }));
    const req = http.expectOne('/api/expenses-reports/save-report');
    expect(req.request.body).toEqual({ reportName: 'November', electricity: 100, payroll: 5000, water: 350, maintenanceExpenses: 500 });
    req.flush({ message: 'ok' });
    expect((await created).name).toBe('November');
  });

  it('updates a report and reloads it', async () => {
    const { api, http } = setup();
    const updated = firstValueFrom(api.update('EP00004', { name: 'October', expenses: EXPENSES }));
    const req = http.expectOne('/api/expenses-reports/update-report');
    expect(req.request.body).toMatchObject({ id: 4, reportName: 'October', maintenanceExpenses: 500 });
    req.flush({ message: 'ok' });
    http.expectOne('/api/expenses-reports/4/details').flush({ ...DETAILS, electricity: 100 });
    http.expectOne(listUrl).flush(LIST);
    expect((await updated).expenses.electricity).toBe(100);
  });

  it('deletes a report by its numeric id', async () => {
    const { api, http } = setup();
    const deleted = firstValueFrom(api.delete('EP00004'));
    http.expectOne('/api/expenses-reports/delete/4').flush({ message: 'ok' });
    await expect(deleted).resolves.toBeUndefined();
  });

  it('downloads the selected reports as one zip', async () => {
    const { api, http } = setup();
    const files = firstValueFrom(api.export(['EP00004', 'EP00002']));
    const req = http.expectOne('/api/expenses-reports/download');
    expect(req.request.body).toEqual({ reportIds: [4, 2] });
    req.flush(new Blob(['x']), { headers: new HttpHeaders({ 'Content-Disposition': "attachment; filename*=UTF-8''expense_reports.zip" }) });
    expect((await files)[0].fileName).toBe('expense_reports.zip');
  });
});
