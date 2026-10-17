import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog.service';

function open() {
  const results: boolean[] = [];
  TestBed.inject(ConfirmDialogService)
    .confirm({
      title: 'Are you sure you want to delete report?',
      message: 'This action cannot be undone.',
      tone: 'danger',
      cancelLabel: 'Cancel',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    })
    .subscribe((result) => results.push(result));
  TestBed.tick();
  const panes = document.querySelectorAll('.cdk-overlay-pane');
  return { results, pane: panes[panes.length - 1] };
}

describe('ConfirmDialogService', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('renders title, message and buttons', () => {
    const { pane } = open();
    expect(pane.querySelector('h2')!.textContent).toContain('delete report');
    expect(pane.querySelector('.message')!.textContent).toContain('cannot be undone');
    const labels = Array.from(pane.querySelectorAll('.actions button')).map((b) =>
      b.textContent?.trim(),
    );
    expect(labels).toEqual(['Cancel', 'Delete']);
  });

  it('emits true on confirm', () => {
    const { results, pane } = open();
    pane.querySelectorAll<HTMLButtonElement>('.actions button')[1].click();
    expect(results).toEqual([true]);
  });

  it('emits false on cancel and on close', () => {
    const cancelled = open();
    cancelled.pane.querySelectorAll<HTMLButtonElement>('.actions button')[0].click();
    expect(cancelled.results).toEqual([false]);

    const closed = open();
    closed.pane.querySelector<HTMLButtonElement>('button.close')!.click();
    expect(closed.results).toEqual([false]);
  });
});
