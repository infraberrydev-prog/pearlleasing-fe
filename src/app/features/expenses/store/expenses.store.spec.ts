import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { Store, provideState, provideStore } from '@ngrx/store';
import { ExpensesApi, MockExpensesApi } from '../data/expenses-api';
import { expenseTotal } from '../models/expense-report';
import { expensesEditorActions, expensesListActions } from './expenses.actions';
import * as expensesEffects from './expenses.effects';
import { expensesFeature } from './expenses.feature';

describe('expenseTotal', () => {
  it('adds the four amounts', () => {
    expect(expenseTotal({ electricity: 1500, payroll: 5000, water: 500, maintenance: 1500.5 })).toBe(8500.5);
  });
});

describe('expenses store with the mock API', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideEffects(),
        { provide: ExpensesApi, useClass: MockExpensesApi },
        provideState(expensesFeature),
        provideEffects(expensesEffects),
      ],
    });
    const store = TestBed.inject(Store);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const select = <T>(selector: (s: object) => T) => store.selectSignal(selector)();
    return { store, navigate, select };
  }

  it('lists EP reports with their total expenses', async () => {
    const { store, select } = setup();
    store.dispatch(expensesListActions.opened());
    await vi.advanceTimersByTimeAsync(400);
    const reports = select(expensesFeature.selectReports);
    expect(reports).toHaveLength(8);
    expect(reports[0].id).toMatch(/^EP\d{5}$/);
    expect(select(expensesFeature.selectGrandTotal)).toBe(14);
  });

  it('creates a report and returns to the list with the notice', async () => {
    const { store, navigate, select } = setup();
    store.dispatch(
      expensesEditorActions.submitted({
        id: null,
        draft: { name: 'Expenses for June', expenses: { electricity: 1500, payroll: 5000, water: 500, maintenance: 1500 } },
      }),
    );
    await vi.advanceTimersByTimeAsync(400);
    expect(navigate).toHaveBeenCalledWith('/expenses');
    expect(select(expensesFeature.selectNotice)).toBe('Report successfully submitted!');

    store.dispatch(expensesListActions.queryChanged({ query: { search: 'june' } }));
    await vi.advanceTimersByTimeAsync(400);
    expect(select(expensesFeature.selectReports).map((r) => [r.name, r.amount])).toContainEqual(['Expenses for June', 8500]);
  });
});
