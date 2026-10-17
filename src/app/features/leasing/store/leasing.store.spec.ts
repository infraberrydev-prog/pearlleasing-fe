import { TestBed } from '@angular/core/testing';
import { provideEffects } from '@ngrx/effects';
import { Store, provideState, provideStore } from '@ngrx/store';
import { EMPTY_FILTER } from '../../reports/models/report';
import { LeasingApi, MockLeasingApi } from '../data/leasing-api';
import { leasingListActions } from './leasing.actions';
import * as leasingEffects from './leasing.effects';
import { initialLeasingState, leasingFeature } from './leasing.feature';

describe('leasing reducer', () => {
  const reducer = leasingFeature.reducer;

  it('resets to page 1 when anything but the page changes', () => {
    let state = reducer(initialLeasingState, leasingListActions.queryChanged({ query: { page: 3 } }));
    expect(state.query.page).toBe(3);
    state = reducer(state, leasingListActions.queryChanged({ query: { search: 'jan' } }));
    expect(state.query).toMatchObject({ page: 1, search: 'jan' });
  });
});

describe('leasing effects with the mock API', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideEffects(),
        { provide: LeasingApi, useClass: MockLeasingApi },
        provideState(leasingFeature),
        provideEffects(leasingEffects),
      ],
    });
    const store = TestBed.inject(Store);
    const select = <T>(selector: (s: object) => T) => store.selectSignal(selector)();
    return { store, select };
  }

  it('loads the first page on open', async () => {
    const { store, select } = setup();
    store.dispatch(leasingListActions.opened());
    expect(select(leasingFeature.selectLoading)).toBe(true);
    await vi.advanceTimersByTimeAsync(400);

    expect(select(leasingFeature.selectLoaded)).toBe(true);
    expect(select(leasingFeature.selectReports)).toHaveLength(8);
    expect(select(leasingFeature.selectGrandTotal)).toBe(22);
    expect(select(leasingFeature.selectPageCount)).toBe(3);
  });

  it('reloads after a delete', async () => {
    const { store, select } = setup();
    store.dispatch(leasingListActions.opened());
    await vi.advanceTimersByTimeAsync(400);
    const first = select(leasingFeature.selectReports)[0].id;

    store.dispatch(leasingListActions.deleteConfirmed({ id: first }));
    await vi.advanceTimersByTimeAsync(800);
    expect(select(leasingFeature.selectGrandTotal)).toBe(21);
    expect(select(leasingFeature.selectReports).map((r) => r.id)).not.toContain(first);
  });

  it('applies filters through the query', async () => {
    const { store, select } = setup();
    store.dispatch(
      leasingListActions.queryChanged({ query: { filter: { ...EMPTY_FILTER, updated: 'updated' } } }),
    );
    await vi.advanceTimersByTimeAsync(400);
    expect(select(leasingFeature.selectReports).every((r) => r.updatedAt !== null)).toBe(true);
  });
});
