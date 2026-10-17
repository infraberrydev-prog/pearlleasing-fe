import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ReportPage, ReportQuery } from '../../reports/models/report';

export const leasingListActions = createActionGroup({
  source: 'Leasing List',
  events: {
    Opened: emptyProps(),
    /** Search, sort, filter or page change. Anything but `page` resets to page 1. */
    'Query Changed': props<{ query: Partial<ReportQuery> }>(),
    'Delete Confirmed': props<{ id: string }>(),
    'Download Confirmed': props<{ ids: readonly string[] }>(),
  },
});

export const leasingApiActions = createActionGroup({
  source: 'Leasing API',
  events: {
    Loaded: props<{ page: ReportPage }>(),
    'Load Failed': props<{ error: string }>(),
    Deleted: props<{ id: string }>(),
    'Delete Failed': props<{ error: string }>(),
    Downloaded: emptyProps(),
    'Download Failed': props<{ error: string }>(),
  },
});
