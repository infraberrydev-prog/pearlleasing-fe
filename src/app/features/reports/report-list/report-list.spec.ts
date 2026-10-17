import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_QUERY, ReportQuery, ReportSummary } from '../models/report';
import { ReportList } from './report-list';

const REPORTS: ReportSummary[] = [
  { id: 'RP1', name: 'Report for January', amount: 100500, createdAt: '2025-01-08T00:30:22.000Z', updatedAt: null },
  { id: 'RP2', name: 'Report for February', amount: 2500, createdAt: '2025-02-08T00:30:22.000Z', updatedAt: null },
];

@Component({
  imports: [ReportList],
  template: `
    <app-report-list
      [config]="{ amountLabel: 'Expected Revenue', emptyTitle: 'No available reports yet.', caption: 'Leasing reports' }"
      [reports]="reports()"
      [query]="query()"
      [total]="reports().length"
      [grandTotal]="grandTotal()"
      [pageCount]="1"
      [loaded]="true"
      (queryChange)="changes.push($event)"
      (view)="viewed = $event"
      (deleteConfirmed)="deleted = $event"
      (downloadConfirmed)="downloaded = $event"
    />
  `,
})
class Host {
  reports = signal<ReportSummary[]>(REPORTS);
  grandTotal = signal(2);
  query = signal<ReportQuery>(DEFAULT_QUERY);
  changes: Partial<ReportQuery>[] = [];
  viewed: string | null = null;
  deleted: string | null = null;
  downloaded: readonly string[] | null = null;
}

function setup(layout: 'desktop' | 'tablet' | 'mobile' = 'desktop') {
  const state$ = new BehaviorSubject<BreakpointState>({
    matches: true,
    breakpoints: {
      '(min-width: 1200px)': layout === 'desktop',
      '(max-width: 767.98px)': layout === 'mobile',
    },
  });
  TestBed.configureTestingModule({
    providers: [{ provide: BreakpointObserver, useValue: { observe: () => state$ } }],
  });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, host: fixture.componentInstance };
}

const overlayButtons = () =>
  Array.from(document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-pane .actions button'));

describe('ReportList', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('shows a table with formatted values on desktop', () => {
    const { el } = setup('desktop');
    expect(el.querySelector('app-data-table')).not.toBeNull();
    expect(el.querySelector('app-report-card')).toBeNull();
    expect(el.querySelector('tbody')!.textContent).toContain('₱ 100,500.00');
  });

  it('shows cards on tablet and the compact menu layout on mobile', () => {
    const tablet = setup('tablet');
    expect(tablet.el.querySelectorAll('app-report-card').length).toBe(2);
    expect(tablet.el.querySelector('app-report-card')!.classList).not.toContain('is-compact');
    TestBed.resetTestingModule();

    const mobile = setup('mobile');
    expect(mobile.el.querySelector('app-report-card')!.classList).toContain('is-compact');
  });

  it('shows the empty state when there are no reports at all', () => {
    const { fixture, el, host } = setup();
    host.reports.set([]);
    host.grandTotal.set(0);
    fixture.detectChanges();
    expect(el.querySelector('app-empty-state')!.textContent).toContain('No available reports yet.');
  });

  it('shows the no-results state and can clear search and filters', () => {
    const { fixture, el, host } = setup();
    host.reports.set([]);
    fixture.detectChanges();
    expect(el.querySelector('app-empty-state')!.textContent).toContain('No reports match');
    expect(el.querySelector('app-empty-state img')!.getAttribute('src')).toBe('images/no-results.svg');

    el.querySelector<HTMLButtonElement>('app-empty-state button')!.click();
    expect(host.changes.at(-1)).toMatchObject({ search: '' });
  });

  it('debounces search into a query change', async () => {
    vi.useFakeTimers();
    const { el, host } = setup();
    const input = el.querySelector<HTMLInputElement>('.search input')!;
    input.value = 'jan';
    input.dispatchEvent(new Event('input'));
    expect(host.changes).toEqual([]);
    await vi.advanceTimersByTimeAsync(300);
    expect(host.changes).toEqual([{ search: 'jan' }]);
    vi.useRealTimers();
  });

  it('asks before deleting', () => {
    const { el, host } = setup();
    el.querySelector<HTMLButtonElement>('[aria-label="Delete RP2"]')!.click();
    TestBed.tick();
    expect(document.querySelector('.cdk-overlay-pane h2')!.textContent).toContain('delete report');

    overlayButtons()[1].click();
    expect(host.deleted).toBe('RP2');
  });

  it('downloads the selected reports after confirmation', () => {
    const { fixture, el, host } = setup();
    el.querySelectorAll<HTMLInputElement>('tbody input[type=checkbox]')[0].click();
    fixture.detectChanges();
    Array.from(el.querySelectorAll<HTMLButtonElement>('button'))
      .find((b) => b.textContent?.includes('Download Report'))!
      .click();
    TestBed.tick();
    expect(document.querySelector('.cdk-overlay-pane .message')!.textContent).toContain('1 selected report');

    overlayButtons()[1].click();
    expect(host.downloaded).toEqual(['RP1']);
  });

  it('opens a report from its ID', () => {
    const { el, host } = setup();
    el.querySelector<HTMLButtonElement>('.report-id')!.click();
    expect(host.viewed).toBe('RP1');
  });
});
