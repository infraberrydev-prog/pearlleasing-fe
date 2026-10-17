import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ReportPage, ReportQuery } from '../../reports/models/report';
import { ExpenseReportDetail, ExpenseReportDraft } from '../models/expense-report';

export const expensesListActions = createActionGroup({
  source: 'Expenses List',
  events: {
    Opened: emptyProps(),
    /** Search, sort, filter or page change. Anything but `page` resets to page 1. */
    'Query Changed': props<{ query: Partial<ReportQuery> }>(),
    'Delete Confirmed': props<{ id: string }>(),
    'Download Confirmed': props<{ ids: readonly string[] }>(),
    'Notice Dismissed': emptyProps(),
  },
});

export const expensesEditorActions = createActionGroup({
  source: 'Expenses Editor',
  events: {
    /** `id` null = create a new report. */
    Opened: props<{ id: string | null }>(),
    Submitted: props<{ id: string | null; draft: ExpenseReportDraft }>(),
  },
});

export const expensesApiActions = createActionGroup({
  source: 'Expenses API',
  events: {
    Loaded: props<{ page: ReportPage }>(),
    'Load Failed': props<{ error: string }>(),
    Deleted: props<{ id: string }>(),
    'Delete Failed': props<{ error: string }>(),
    Downloaded: emptyProps(),
    'Download Failed': props<{ error: string }>(),
    'Detail Loaded': props<{ report: ExpenseReportDetail }>(),
    'Detail Load Failed': props<{ error: string }>(),
    Saved: props<{ report: ExpenseReportDetail; created: boolean }>(),
    'Save Failed': props<{ error: string }>(),
  },
});
