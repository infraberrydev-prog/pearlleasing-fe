import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange, DateRangeCalendar } from './date-range-calendar';

@Component({
  imports: [DateRangeCalendar, ReactiveFormsModule],
  template: `<app-date-range-calendar [today]="today" [formControl]="range" />`,
})
class Host {
  today = new Date(2026, 0, 19);
  range = new FormControl<DateRange>({ start: null, end: null });
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const day = (label: string) =>
    el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
  return { fixture, el, day };
}

describe('DateRangeCalendar', () => {
  it('opens on the month of today, Monday first, with today marked', () => {
    const { el, day } = setup();
    expect(el.querySelector('.month-label')!.textContent).toContain('January 2026');
    const weekdays = Array.from(el.querySelectorAll('.weekday')).map((w) => w.textContent);
    expect(weekdays).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
    // Jan 1 2026 is a Thursday, so the grid starts on Mon Dec 29.
    expect(el.querySelector('.day')!.getAttribute('aria-label')).toContain('December 29, 2025');
    expect(day('Monday, January 19, 2026').getAttribute('aria-current')).toBe('date');
  });

  it('selects a start, then an end, and highlights the days between', () => {
    const { fixture, el, day } = setup();
    day('Tuesday, January 20, 2026').click();
    fixture.detectChanges();
    day('Friday, January 30, 2026').click();
    fixture.detectChanges();

    const value = fixture.componentInstance.range.value!;
    expect(value.start!.getDate()).toBe(20);
    expect(value.end!.getDate()).toBe(30);
    expect(el.querySelectorAll('.in-range').length).toBe(9);
    expect(el.querySelector('.fields')!.textContent).toContain('Jan 20, 2026');
    expect(el.querySelector('.fields')!.textContent).toContain('Jan 30, 2026');
  });

  it('swaps when the second click is earlier than the first', () => {
    const { fixture, day } = setup();
    day('Friday, January 30, 2026').click();
    day('Tuesday, January 20, 2026').click();
    const value = fixture.componentInstance.range.value!;
    expect([value.start!.getDate(), value.end!.getDate()]).toEqual([20, 30]);
  });

  it('moves between months', () => {
    const { fixture, el } = setup();
    el.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.month-label')!.textContent).toContain('February 2026');
  });
});
