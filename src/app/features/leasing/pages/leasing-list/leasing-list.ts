import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PageHeader } from '../../../../layout/page-header/page-header';
import { ReportListConfig, ReportQuery } from '../../../reports/models/report';
import { ReportList } from '../../../reports/report-list/report-list';
import { leasingListActions } from '../../store/leasing.actions';
import { leasingFeature } from '../../store/leasing.feature';

const CONFIG: ReportListConfig = {
  amountLabel: 'Expected Revenue',
  emptyTitle: 'No available reports yet.',
  caption: 'Leasing reports',
};

/** Leasing Reports list page (Figma 435:11353 / 374:5831 / 361:13826). */
@Component({
  selector: 'app-leasing-list',
  imports: [PageHeader, ReportList],
  template: `
    <app-page-header title="Leasing Reports" />
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
      (view)="router.navigate(['/leasing', $event])"
      (create)="router.navigate(['/leasing/new'])"
      (deleteConfirmed)="store.dispatch(actions.deleteConfirmed({ id: $event }))"
      (downloadConfirmed)="store.dispatch(actions.downloadConfirmed({ ids: $event }))"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-page' },
})
export class LeasingList {
  protected readonly store = inject(Store);
  protected readonly router = inject(Router);
  protected readonly actions = leasingListActions;
  protected readonly config = CONFIG;

  protected readonly reports = this.store.selectSignal(leasingFeature.selectReports);
  protected readonly query = this.store.selectSignal(leasingFeature.selectQuery);
  protected readonly total = this.store.selectSignal(leasingFeature.selectTotal);
  protected readonly grandTotal = this.store.selectSignal(leasingFeature.selectGrandTotal);
  protected readonly pageCount = this.store.selectSignal(leasingFeature.selectPageCount);
  protected readonly loading = this.store.selectSignal(leasingFeature.selectLoading);
  protected readonly loaded = this.store.selectSignal(leasingFeature.selectLoaded);
  protected readonly error = this.store.selectSignal(leasingFeature.selectError);

  constructor() {
    this.store.dispatch(leasingListActions.opened());
  }

  protected onQueryChange(query: Partial<ReportQuery>): void {
    this.store.dispatch(leasingListActions.queryChanged({ query }));
  }
}
