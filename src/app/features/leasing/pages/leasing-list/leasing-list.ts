import { ChangeDetectionStrategy, Component, Injector, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PageHeader } from '../../../../layout/page-header/page-header';
import { NoticeToast } from '../../../../shared/ui';
import { ReportListConfig, ReportQuery } from '../../../reports/models/report';
import { ReportList } from '../../../reports/report-list/report-list';
import { ReportRowsDialog, ReportRowsDialogData } from '../../components/report-rows-dialog/report-rows-dialog';
import { leasingListActions } from '../../store/leasing.actions';
import { leasingFeature } from '../../store/leasing.feature';

const CONFIG: ReportListConfig = {
  amountLabel: 'Expected Revenue',
  emptyTitle: 'No available reports yet.',
  caption: 'Leasing reports',
  // The API deletes rows inside a report (on its detail page), not whole reports.
  canDelete: false,
};

/** Leasing Reports list page (Figma 435:11353 / 374:5831 / 361:13826). */
@Component({
  selector: 'app-leasing-list',
  imports: [NoticeToast, PageHeader, ReportList],
  template: `
    <app-notice-toast [message]="notice()" (dismissed)="store.dispatch(actions.noticeDismissed())" />
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
      (preview)="openRows($event)"
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
  private readonly dialog = inject(Dialog);
  // The route's injector, so the dialog gets this feature's LeasingApi.
  private readonly injector = inject(Injector);

  protected readonly reports = this.store.selectSignal(leasingFeature.selectReports);
  protected readonly query = this.store.selectSignal(leasingFeature.selectQuery);
  protected readonly total = this.store.selectSignal(leasingFeature.selectTotal);
  protected readonly grandTotal = this.store.selectSignal(leasingFeature.selectGrandTotal);
  protected readonly pageCount = this.store.selectSignal(leasingFeature.selectPageCount);
  protected readonly loading = this.store.selectSignal(leasingFeature.selectLoading);
  protected readonly loaded = this.store.selectSignal(leasingFeature.selectLoaded);
  protected readonly error = this.store.selectSignal(leasingFeature.selectError);
  protected readonly notice = this.store.selectSignal(leasingFeature.selectNotice);

  constructor() {
    this.store.dispatch(leasingListActions.opened());
  }

  protected onQueryChange(query: Partial<ReportQuery>): void {
    this.store.dispatch(leasingListActions.queryChanged({ query }));
  }

  /** Eye icon: the report's rows in a read-only modal. */
  protected openRows(id: string): void {
    this.dialog.open<void, ReportRowsDialogData>(ReportRowsDialog, {
      data: { id },
      injector: this.injector,
      backdropClass: 'app-dialog-backdrop',
      ariaLabelledBy: 'report-rows-title',
    });
  }
}
