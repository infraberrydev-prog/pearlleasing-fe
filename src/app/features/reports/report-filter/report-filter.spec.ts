import { TestBed } from '@angular/core/testing';
import { ReportFilter } from '../models/report';
import { ReportFilterPanel } from './report-filter';

describe('ReportFilterPanel', () => {
  it('emits the entered filter, swapping a reversed amount range', () => {
    const fixture = TestBed.createComponent(ReportFilterPanel);
    fixture.componentRef.setInput('amountLabel', 'Expected Revenue');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let emitted: ReportFilter | null = null;
    fixture.componentInstance.applied.subscribe((f) => (emitted = f));

    const [min, max] = Array.from(el.querySelectorAll<HTMLInputElement>('.range input'));
    min.value = '5000';
    min.dispatchEvent(new Event('input'));
    max.value = '1,000';
    max.dispatchEvent(new Event('input'));
    const select = el.querySelector('select')!;
    select.value = 'updated';
    select.dispatchEvent(new Event('change'));

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(emitted).toMatchObject({ amountMin: 1000, amountMax: 5000, updated: 'updated', createdFrom: null });
  });

  it('labels the amount range with the configured name', () => {
    const fixture = TestBed.createComponent(ReportFilterPanel);
    fixture.componentRef.setInput('amountLabel', 'Total Expenses');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Total Expenses (min-max)');
  });
});
