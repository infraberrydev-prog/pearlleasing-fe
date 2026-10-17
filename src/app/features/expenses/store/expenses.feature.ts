import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { DEFAULT_QUERY, ReportQuery, ReportSummary } from '../../reports/models/report';
import { ExpenseReportDetail } from '../models/expense-report';
import { expensesApiActions, expensesEditorActions, expensesListActions } from './expenses.actions';

export interface ExpensesEditorState {
  /** The report being viewed/updated; null when creating. */
  report: ExpenseReportDetail | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface ExpensesState extends EntityState<ReportSummary> {
  query: ReportQuery;
  total: number;
  grandTotal: number;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  notice: string | null;
  editor: ExpensesEditorState;
}

const adapter = createEntityAdapter<ReportSummary>({ sortComparer: false });

const initialEditor: ExpensesEditorState = { report: null, loading: false, saving: false, error: null };

export const initialExpensesState: ExpensesState = adapter.getInitialState({
  query: DEFAULT_QUERY,
  total: 0,
  grandTotal: 0,
  loading: false,
  loaded: false,
  error: null,
  notice: null,
  editor: initialEditor,
});

export const expensesFeature = createFeature({
  name: 'expenses',
  reducer: createReducer(
    initialExpensesState,
    // List
    on(expensesListActions.opened, (state) => ({ ...state, loading: true, error: null })),
    on(expensesListActions.queryChanged, (state, { query }) => {
      const pageOnly = Object.keys(query).every((key) => key === 'page');
      return {
        ...state,
        loading: true,
        error: null,
        query: { ...state.query, ...query, page: pageOnly ? (query.page ?? state.query.page) : 1 },
      };
    }),
    on(expensesApiActions.loaded, (state, { page }) =>
      adapter.setAll(page.items, {
        ...state,
        total: page.total,
        grandTotal: page.grandTotal,
        loading: false,
        loaded: true,
      }),
    ),
    on(expensesApiActions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
    on(expensesListActions.deleteConfirmed, (state) => ({ ...state, loading: true })),
    on(expensesApiActions.deleteFailed, expensesApiActions.downloadFailed, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(expensesListActions.noticeDismissed, (state) => ({ ...state, notice: null })),

    // Editor
    on(expensesEditorActions.opened, (state, { id }) => ({
      ...state,
      editor: { ...initialEditor, loading: id !== null },
    })),
    on(expensesApiActions.detailLoaded, (state, { report }) => ({
      ...state,
      editor: { ...state.editor, report, loading: false },
    })),
    on(expensesApiActions.detailLoadFailed, (state, { error }) => ({
      ...state,
      editor: { ...state.editor, loading: false, error },
    })),
    on(expensesEditorActions.submitted, (state) => ({
      ...state,
      editor: { ...state.editor, saving: true, error: null },
    })),
    on(expensesApiActions.saved, (state, { created }) => ({
      ...state,
      editor: initialEditor,
      notice: created ? 'Report successfully submitted!' : 'Report successfully updated!',
    })),
    on(expensesApiActions.saveFailed, (state, { error }) => ({
      ...state,
      editor: { ...state.editor, saving: false, error },
    })),
  ),
  extraSelectors: ({ selectExpensesState, selectQuery, selectTotal }) => ({
    selectReports: createSelector(selectExpensesState, adapter.getSelectors().selectAll),
    selectPageCount: createSelector(selectQuery, selectTotal, (query, total) =>
      Math.max(1, Math.ceil(total / query.pageSize)),
    ),
  }),
});
