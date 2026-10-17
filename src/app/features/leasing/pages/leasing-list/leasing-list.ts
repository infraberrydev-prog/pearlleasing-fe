import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PageHeader } from '../../../../layout/page-header/page-header';
import { Alert } from '../../../../shared/ui';
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
  imports: [Alert, PageHeader, ReportList],
  template: `
    @if (notice(); as message) {
      <app-alert class="toast" tone="success" dismissible (dismissed)="dismissNotice()">{{ message }}</app-alert>
    }
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
  // Toast position from Figma 65:3364 (Alert at the top right of the page).
  styles: `
    .toast {
      position: fixed;
      top: var(--spacing-3xl);
      right: var(--spacing-3xl);
      z-index: 30;
      width: 360px;
      max-width: calc(100vw - 32px);
      box-shadow: var(--shadow-lg);
    }
    @media (max-width: 767.98px) {
      .toast {
        top: var(--spacing-xl);
        right: var(--spacing-xl);
      }
    }
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
  protected readonly notice = this.store.selectSignal(leasingFeature.selectNotice);

  constructor() {
    this.store.dispatch(leasingListActions.opened());
    // The toast closes itself after a few seconds.
    effect((onCleanup) => {
      if (!this.notice()) return;
      const timer = setTimeout(() => this.dismissNotice(), 5000);
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected dismissNotice(): void {
    this.store.dispatch(leasingListActions.noticeDismissed());
  }

  protected onQueryChange(query: Partial<ReportQuery>): void {
    this.store.dispatch(leasingListActions.queryChanged({ query }));
  }
}
