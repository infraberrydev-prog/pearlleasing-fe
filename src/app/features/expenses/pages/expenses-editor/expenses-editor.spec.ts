import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ExpenseReportDetail } from '../../models/expense-report';
import { expensesEditorActions } from '../../store/expenses.actions';
import { initialExpensesState } from '../../store/expenses.feature';
import { ExpensesEditor } from './expenses-editor';

const REPORT: ExpenseReportDetail = {
  id: 'EP1',
  name: 'Expenses for May',
  expenses: { electricity: 1500, payroll: 5000, water: 500, maintenance: 1500 },
  createdAt: '2025-05-01T00:30:22.000Z',
  updatedAt: null,
};

function setup(id: string | null = null) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideMockStore({ initialState: { expenses: initialExpensesState } }),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } },
    ],
  });
  const store = TestBed.inject(MockStore);
  const dispatch = vi.spyOn(store, 'dispatch');
  vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(ExpensesEditor);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const field = (label: string) =>
    Array.from(el.querySelectorAll('app-input-field')).find((f) =>
      f.querySelector('label')?.textContent?.trim().startsWith(label),
    )!;
  const type = (label: string, value: string) => {
    const input = field(label).querySelector('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const button = (text: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === text)!;
  const submitted = () =>
    dispatch.mock.calls
      .map(([a]) => a as unknown as Action)
      .find((a) => a.type === expensesEditorActions.submitted.type);
  return { fixture, el, store, dispatch, field, type, button, submitted };
}

describe('ExpensesEditor', () => {
  it('shows the four required expense fields from Figma', () => {
    const { el, button } = setup();
    expect(el.querySelector('h1')!.textContent).toBe('Create Report');
    const labels = Array.from(el.querySelectorAll('.grid label')).map((l) => l.textContent?.replace('*', '').trim());
    expect(labels).toEqual(['Electricity', 'Payroll', 'Water', 'Maintenance Expenses']);
    expect(button('Submit Report').disabled).toBe(true);
  });

  it('totals the amounts and submits the report', () => {
    const s = setup();
    s.type('Report Name', 'Expenses for June');
    s.type('Electricity', '1,500');
    s.type('Payroll', '5000');
    s.type('Water', '500.50');
    s.type('Maintenance Expenses', '1500');
    expect(s.el.querySelector('.total')!.textContent).toContain('₱ 8,500.50');

    s.button('Submit Report').click();
    expect(s.submitted()).toMatchObject({
      id: null,
      draft: { name: 'Expenses for June', expenses: { electricity: 1500, payroll: 5000, water: 500.5, maintenance: 1500 } },
    });
  });

  it('shows an existing report and enables Update Report after a change', () => {
    const s = setup('EP1');
    expect(s.dispatch).toHaveBeenCalledWith(expensesEditorActions.opened({ id: 'EP1' }));
    s.store.setState({
      expenses: { ...initialExpensesState, editor: { report: REPORT, loading: false, saving: false, error: null } },
    });
    s.fixture.detectChanges();
    expect(s.el.querySelector('h1')!.textContent).toBe('EP1 - Expenses for May');
    expect(s.el.querySelector('.total')!.textContent).toContain('₱ 8,500.00');
    expect(s.button('Update Report').disabled).toBe(true);

    s.type('Water', '700');
    expect(s.button('Update Report').disabled).toBe(false);
    s.button('Update Report').click();
    expect(s.submitted()).toMatchObject({ id: 'EP1', draft: { expenses: { water: 700 } } });
  });
});
