import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { DEFAULT_QUERY, ReportQuery, ReportSummary } from '../../reports/models/report';
import { leasingApiActions, leasingListActions } from './leasing.actions';

export interface LeasingState extends EntityState<ReportSummary> {
  query: ReportQuery;
  total: number;
  grandTotal: number;
  loading: boolean;
  /** True once the first page has arrived (avoids flashing the empty state). */
  loaded: boolean;
  error: string | null;
}

const adapter = createEntityAdapter<ReportSummary>({ sortComparer: false });

export const initialLeasingState: LeasingState = adapter.getInitialState({
  query: DEFAULT_QUERY,
  total: 0,
  grandTotal: 0,
  loading: false,
  loaded: false,
  error: null,
});

export const leasingFeature = createFeature({
  name: 'leasing',
  reducer: createReducer(
    initialLeasingState,
    on(leasingListActions.opened, (state) => ({ ...state, loading: true, error: null })),
    on(leasingListActions.queryChanged, (state, { query }) => {
      const pageOnly = Object.keys(query).every((key) => key === 'page');
      return {
        ...state,
        loading: true,
        error: null,
        query: { ...state.query, ...query, page: pageOnly ? (query.page ?? state.query.page) : 1 },
      };
    }),
    on(leasingApiActions.loaded, (state, { page }) =>
      adapter.setAll(page.items, {
        ...state,
        total: page.total,
        grandTotal: page.grandTotal,
        loading: false,
        loaded: true,
      }),
    ),
    on(leasingApiActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
    on(leasingListActions.deleteConfirmed, (state) => ({ ...state, loading: true })),
    on(leasingApiActions.deleteFailed, leasingApiActions.downloadFailed, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
  ),
  extraSelectors: ({ selectLeasingState, selectQuery, selectTotal }) => ({
    selectReports: createSelector(selectLeasingState, adapter.getSelectors().selectAll),
    selectPageCount: createSelector(selectQuery, selectTotal, (query, total) =>
      Math.max(1, Math.ceil(total / query.pageSize)),
    ),
  }),
});
