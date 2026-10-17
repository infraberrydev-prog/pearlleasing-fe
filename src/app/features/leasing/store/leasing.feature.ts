import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { DEFAULT_QUERY, ReportQuery, ReportSummary } from '../../reports/models/report';
import { LeasingLookups, LeasingReportDetail } from '../models/leasing-report';
import { leasingApiActions, leasingEditorActions, leasingListActions } from './leasing.actions';

export interface LeasingEditorState {
  /** The report being edited; null when creating. */
  report: LeasingReportDetail | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface LeasingState extends EntityState<ReportSummary> {
  query: ReportQuery;
  total: number;
  grandTotal: number;
  loading: boolean;
  /** True once the first page has arrived (avoids flashing the empty state). */
  loaded: boolean;
  error: string | null;
  /** Success toast shown on the list after a save ("Report successfully submitted!"). */
  notice: string | null;
  editor: LeasingEditorState;
  lookups: LeasingLookups | null;
}

const adapter = createEntityAdapter<ReportSummary>({ sortComparer: false });

const initialEditor: LeasingEditorState = { report: null, loading: false, saving: false, error: null };

export const initialLeasingState: LeasingState = adapter.getInitialState({
  query: DEFAULT_QUERY,
  total: 0,
  grandTotal: 0,
  loading: false,
  loaded: false,
  error: null,
  notice: null,
  editor: initialEditor,
  lookups: null,
});

export const leasingFeature = createFeature({
  name: 'leasing',
  reducer: createReducer(
    initialLeasingState,
    // List
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
    on(leasingListActions.noticeDismissed, (state) => ({ ...state, notice: null })),

    // Editor
    on(leasingEditorActions.opened, (state, { id }) => ({
      ...state,
      editor: { ...initialEditor, loading: id !== null },
    })),
    on(leasingApiActions.detailLoaded, (state, { report }) => ({
      ...state,
      editor: { ...state.editor, report, loading: false },
    })),
    on(leasingApiActions.detailLoadFailed, (state, { error }) => ({
      ...state,
      editor: { ...state.editor, loading: false, error },
    })),
    on(leasingApiActions.lookupsLoaded, (state, { lookups }) => ({ ...state, lookups })),
    on(leasingEditorActions.submitted, (state) => ({
      ...state,
      editor: { ...state.editor, saving: true, error: null },
    })),
    on(leasingApiActions.saved, (state, { created }) => ({
      ...state,
      editor: initialEditor,
      // Copy from Figma 69:1655; the update wording isn't designed.
      notice: created ? 'Report successfully submitted!' : 'Report successfully updated!',
    })),
    on(leasingApiActions.saveFailed, (state, { error }) => ({
      ...state,
      editor: { ...state.editor, saving: false, error },
    })),
  ),
  extraSelectors: ({ selectLeasingState, selectQuery, selectTotal }) => ({
    selectReports: createSelector(selectLeasingState, adapter.getSelectors().selectAll),
    selectPageCount: createSelector(selectQuery, selectTotal, (query, total) =>
      Math.max(1, Math.ceil(total / query.pageSize)),
    ),
  }),
});
