import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PageHeader } from '../../../../layout/page-header/page-header';
import { NoticeToast } from '../../../../shared/ui';
import { ReportListConfig, ReportQuery } from '../../../reports/models/report';
import { ReportList } from '../../../reports/report-list/report-list';
import { expensesListActions } from '../../store/expenses.actions';
import { expensesFeature } from '../../store/expenses.feature';

const CONFIG: ReportListConfig = {
  amountLabel: 'Total Expenses',
  emptyTitle: 'No available reports yet.',
  caption: 'Expenses reports',
};

/**
 * Expenses Reports list (Figma 94:4161 desktop, 374:7245 tablet, 373:5589 mobile, 315:7325 empty,
 * 315:7685 no results). Same shared report list as Leasing, with "Total Expenses".
 */
@Component({
  selector: 'app-expenses-list',
  imports: [NoticeToast, PageHeader, ReportList],
  template: `
    <app-notice-toast [message]="notice()" (dismissed)="store.dispatch(actions.noticeDismissed())" />
    <app-page-header title="Expenses Reports" />
    <app-report-list
      [config]="config"
      [reports]="reports()"
      [query]="query()"
      [total]="total()"
      [grandTotal]="grandTotal()"
      [pageCount]="pageCount()"
      [loading]="loading()"
      [loaded]="loaded()"
      [error]="error()"
      (queryChange)="onQueryChange($event)"
      (view)="router.navigate(['/expenses', $event])"
      (preview)="router.navigate(['/expenses', $event])"
      (create)="router.navigate(['/expenses/new'])"
      (deleteConfirmed)="store.dispatch(actions.deleteConfirmed({ id: $event }))"
      (downloadConfirmed)="store.dispatch(actions.downloadConfirmed({ ids: $event }))"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-page' },
})
export class ExpensesList {
  protected readonly store = inject(Store);
  protected readonly router = inject(Router);
  protected readonly actions = expensesListActions;
  protected readonly config = CONFIG;

  protected readonly reports = this.store.selectSignal(expensesFeature.selectReports);
  protected readonly query = this.store.selectSignal(expensesFeature.selectQuery);
  protected readonly total = this.store.selectSignal(expensesFeature.selectTotal);
  protected readonly grandTotal = this.store.selectSignal(expensesFeature.selectGrandTotal);
  protected readonly pageCount = this.store.selectSignal(expensesFeature.selectPageCount);
  protected readonly loading = this.store.selectSignal(expensesFeature.selectLoading);
  protected readonly loaded = this.store.selectSignal(expensesFeature.selectLoaded);
  protected readonly error = this.store.selectSignal(expensesFeature.selectError);
  protected readonly notice = this.store.selectSignal(expensesFeature.selectNotice);

  constructor() {
    this.store.dispatch(expensesListActions.opened());
  }

  protected onQueryChange(query: Partial<ReportQuery>): void {
    this.store.dispatch(expensesListActions.queryChanged({ query }));
  }
}
