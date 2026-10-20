import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LeasingReportDetail } from '../../models/leasing-report';
import { leasingEditorActions } from '../../store/leasing.actions';
import { initialLeasingState } from '../../store/leasing.feature';
import { LeasingEditor } from './leasing-editor';

const LOOKUPS = {
  buildingTypes: ['Pearl Plaza'],
  vendors: ['J&C Supplies'],
  stalls: ['A-01'],
  paymentMethods: ['Cash', 'GCash'],
};

const REPORT: LeasingReportDetail = {
  id: 'RP1',
  name: 'Report for Month of January',
  createdAt: '2025-01-08T00:30:22.000Z',
  updatedAt: null,
  rows: [
    {
      buildingType: 'Pearl Plaza', vendor: 'J&C Supplies', stall: 'A-01', lesseeName: 'John Martial',
      mobileNumber: null, tin: null, monthlyRental: 2500, paymentStatus: 'unpaid', paymentMethod: 'Cash',
      referenceNumber: 'REF-1', electricity: 500, water: 300, otherUtilities: 200, cusaFee: null,
      pylonRental: null, penalty: null,
    },
  ],
};

function setup(id: string | null = null) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideMockStore({ initialState: { leasing: { ...initialLeasingState, lookups: LOOKUPS } } }),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } },
    ],
  });
  const store = TestBed.inject(MockStore);
  const dispatch = vi.spyOn(store, 'dispatch');
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(LeasingEditor);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const type = (selector: string, value: string, root: ParentNode = el) => {
    const input = root.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event(input instanceof HTMLSelectElement ? 'change' : 'input'));
    input.dispatchEvent(new Event('blur'));
  };
  const field = (label: string) =>
    Array.from(el.querySelectorAll('app-input-field, app-select-field')).find((f) =>
      f.querySelector('label')?.textContent?.trim().startsWith(label),
    )!;
  const button = (text: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === text)!;
  return { fixture, el, store, dispatch, navigate, type, field, button };
}

function fillRow(s: ReturnType<typeof setup>) {
  const set = (label: string, value: string) => {
    const f = s.field(label);
    s.type(f.querySelector('input') ? 'input' : 'select', value, f);
  };
  set('Report Name', 'Report for Month of May');
  set('Building Type', 'Pearl Plaza');
  set('Vendor Name / Category', 'J&C Supplies');
  set('Stall / Unit', 'A-01');
  set('Name of Lessee', 'John Martial');
  set('Monthly Rental', '2,500');
  set('Payment Status', 'paid');
  set('Payment Method', 'Cash');
  set('Reference Number', 'REF-9');
  set('Electricity', '500');
  set('Water', '300');
  set('Other Utilities', '200');
  s.fixture.detectChanges();
}

describe('LeasingEditor', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('starts with one expanded row and Submit disabled', () => {
    const { el, dispatch, button } = setup();
    expect(dispatch).toHaveBeenCalledWith(leasingEditorActions.opened({ id: null }));
    expect(el.querySelector('h1')!.textContent).toBe('Create Report');
    expect(el.querySelectorAll('app-lease-row-form').length).toBe(1);
    expect(el.textContent).toContain('Lessee Information');
    expect(button('Submit Report').disabled).toBe(true);
  });

  it('updates the row total and header as amounts are typed', () => {
    const s = setup();
    fillRow(s);
    s.type('input', '100', s.field('10% Penalty'));
    s.fixture.detectChanges();
    expect(s.el.querySelector('.total')!.textContent).toContain('₱ 3,400.00');
    expect(s.el.querySelector('.summary')!.textContent).toContain('Pearl Plaza / J&C Supplies / John Martial');
  });

  it('submits a valid report', () => {
    const s = setup();
    fillRow(s);
    expect(s.button('Submit Report').disabled).toBe(false);
    s.button('Submit Report').click();

    const action = s.dispatch.mock.calls.map(([a]) => a as unknown as Action).find((a) => a.type === leasingEditorActions.submitted.type);
    expect(action).toMatchObject({
      id: null,
      draft: { name: 'Report for Month of May', rows: [{ monthlyRental: 2500, paymentStatus: 'paid', penalty: null }] },
    });
  });

  it('adds and duplicates rows', () => {
    const s = setup();
    fillRow(s);
    s.button('Add Row').click();
    s.fixture.detectChanges();
    expect(s.el.querySelectorAll('app-lease-row-form').length).toBe(2);

    s.el.querySelector<HTMLButtonElement>('[aria-label="Duplicate row 1"]')!.click();
    s.fixture.detectChanges();
    const rows = s.el.querySelectorAll('app-lease-row-form');
    expect(rows.length).toBe(3);
    expect(rows[1].querySelector('.summary')!.textContent).toContain('Pearl Plaza');
  });

  it('asks before deleting a row', () => {
    const s = setup();
    s.button('Add Row').click();
    s.fixture.detectChanges();
    s.el.querySelector<HTMLButtonElement>('[aria-label="Delete row 2"]')!.click();
    TestBed.tick();
    Array.from(document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-pane .actions button')).at(-1)!.click();
    s.fixture.detectChanges();
    expect(s.el.querySelectorAll('app-lease-row-form').length).toBe(1);
  });

  it('asks before discarding edits and leaves only on "Leave & Discard"', () => {
    const s = setup();
    fillRow(s);
    s.button('Discard').click();
    TestBed.tick();
    const [leave] = Array.from(document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-pane .actions button'));
    expect(leave.textContent?.trim()).toBe('Leave & Discard');
    leave.click();
    expect(s.navigate).toHaveBeenCalledWith('/leasing');
  });

});

describe('LeasingEditor detail page (Unpaid → Paid)', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  function open(report: LeasingReportDetail = REPORT) {
    const s = setup(report.id);
    s.store.setState({
      leasing: {
        ...initialLeasingState,
        lookups: LOOKUPS,
        editor: { report, loading: false, saving: false, error: null },
      },
    });
    s.fixture.detectChanges();
    return s;
  }

  const many = (count: number): LeasingReportDetail => ({
    ...REPORT,
    rows: Array.from({ length: count }, (_, i) => ({
      ...REPORT.rows[0],
      lesseeName: `Lessee ${i + 1}`,
      paymentStatus: i % 3 === 0 ? 'unpaid' : 'paid',
    })),
  });

  it('shows the report with status chips and Update Report disabled until a change', () => {
    const s = open();
    expect(s.dispatch).toHaveBeenCalledWith(leasingEditorActions.opened({ id: 'RP1' }));
    expect(s.el.querySelector('h1')!.textContent).toBe('RP1 - Report for Month of January');
    expect(s.el.querySelector<HTMLInputElement>('.report-name input')!.value).toBe('Report for Month of January');
    expect(s.el.querySelector('app-lease-row-form app-chip')!.textContent?.trim()).toBe('Unpaid');
    // Only Delete: no edit or duplicate on the detail page.
    expect(s.el.querySelector('[aria-label="Edit row 1"]')).toBeNull();
    expect(s.el.querySelector('[aria-label="Duplicate row 1"]')).toBeNull();
    expect(s.button('Update Report').disabled).toBe(true);
  });

  it('marks a row as paid and submits the update', () => {
    const s = open();
    s.el.querySelector<HTMLButtonElement>('app-lease-row-form .toggle')!.click();
    s.fixture.detectChanges();
    s.type('select', 'paid', s.field('Payment Status'));
    s.fixture.detectChanges();

    expect(s.el.querySelector('app-lease-row-form app-chip')!.textContent?.trim()).toBe('Paid');
    expect(s.button('Update Report').disabled).toBe(false);
    s.button('Update Report').click();

    const action = s.dispatch.mock.calls
      .map(([a]) => a as unknown as Action)
      .find((a) => a.type === leasingEditorActions.submitted.type);
    expect(action).toMatchObject({
      id: 'RP1',
      draft: { rows: [{ paymentStatus: 'paid', lesseeName: 'John Martial' }] },
    });
  });

  it('deletes a row and submits the report without it', () => {
    const s = open(many(2));
    s.el.querySelector<HTMLButtonElement>('[aria-label="Delete row 2"]')!.click();
    TestBed.tick();
    Array.from(document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-pane .actions button')).at(-1)!.click();
    s.fixture.detectChanges();

    expect(s.el.querySelectorAll('app-lease-row-form').length).toBe(1);
    s.button('Update Report').click();
    const action = s.dispatch.mock.calls
      .map(([a]) => a as unknown as Action)
      .find((a) => a.type === leasingEditorActions.submitted.type);
    expect(action).toMatchObject({ draft: { rows: [{ lesseeName: 'Lessee 1' }] } });

    // While saving, the old report is still in the store; the deleted row must not come back.
    const state = s.store.selectSignal((st: object) => st)() as { leasing: typeof initialLeasingState };
    s.store.setState({ leasing: { ...state.leasing, editor: { ...state.leasing.editor, saving: true } } });
    s.fixture.detectChanges();
    expect(s.el.querySelectorAll('app-lease-row-form').length).toBe(1);
  });

  it('pages rows ten at a time and counts them', () => {
    const s = open(many(23));
    expect(s.el.querySelectorAll('app-lease-row-form').length).toBe(10);
    expect(s.el.querySelector('.row-count')!.textContent).toContain('Total rows: 23');
    s.button('3').click();
    s.fixture.detectChanges();
    const rows = s.el.querySelectorAll('app-lease-row-form .summary');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('Row 21 -');
  });

  it('searches by lessee name', () => {
    const s = open(many(23));
    const search = s.el.querySelector<HTMLInputElement>('.search input')!;
    search.value = 'lessee 2';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    s.fixture.detectChanges();
    // "Lessee 2" and "Lessee 20" to "Lessee 23"
    expect(s.el.querySelector('.row-count')!.textContent).toContain('Total rows: 5');
  });

  it('sorts unpaid rows first', () => {
    const s = open(many(6));
    s.button('Sort').click();
    s.fixture.detectChanges();
    const pane = document.querySelector('.cdk-overlay-pane')!;
    pane.querySelector<HTMLInputElement>('input[type=radio]')!.click();
    Array.from(pane.querySelectorAll<HTMLButtonElement>('button'))
      .find((b) => b.textContent?.trim() === 'Apply')!
      .click();
    s.fixture.detectChanges();
    const chips = () =>
      Array.from(s.el.querySelectorAll('app-lease-row-form app-chip')).map((c) => c.textContent?.trim());
    expect(chips()).toEqual(['Unpaid', 'Unpaid', 'Paid', 'Paid', 'Paid', 'Paid']);

    // Marking the first row Paid keeps it in place while editing.
    s.el.querySelector<HTMLButtonElement>('app-lease-row-form .toggle')!.click();
    s.fixture.detectChanges();
    s.type('select', 'paid', s.field('Payment Status'));
    s.fixture.detectChanges();
    expect(chips()[0]).toBe('Paid');
    expect(s.el.querySelector('app-lease-row-form .summary')!.textContent).toContain('Row 1 -');
  });

  it('asks before cancelling an edit', () => {
    const s = open();
    s.type('input', 'Renamed report', s.field('Report Name'));
    s.fixture.detectChanges();
    s.button('Cancel').click();
    TestBed.tick();
    expect(document.querySelector('.cdk-overlay-pane h2')!.textContent).toContain('cancel edit');
  });
});
