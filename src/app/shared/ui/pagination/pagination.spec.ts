import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Pagination, pageItems } from './pagination';

describe('pageItems', () => {
  it('lists every page when there are few', () => {
    expect(pageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('matches the Figma pattern on page 1 of 10', () => {
    expect(pageItems(1, 10)).toEqual([1, 2, 3, 'gap', 8, 9, 10]);
  });

  it('keeps the neighbours of a middle page', () => {
    expect(pageItems(5, 10)).toEqual([1, 2, 3, 4, 5, 6, 'gap', 8, 9, 10]);
  });
});

@Component({
  imports: [Pagination],
  template: `<app-pagination [pageCount]="10" [(page)]="page" />`,
})
class Host {
  page = signal(1);
}

describe('Pagination', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
    const byText = (text: string) => buttons().find((b) => b.textContent?.trim() === text)!;
    return { fixture, el, byText };
  }

  it('marks the current page and disables Previous on the first page', () => {
    const { el, byText } = setup();
    expect(el.querySelector('[aria-current="page"]')!.textContent?.trim()).toBe('1');
    expect(byText('Previous').disabled).toBe(true);
  });

  it('changes page from numbers and Next', () => {
    const { fixture, byText } = setup();
    byText('3').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(3);

    byText('Next').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(4);
  });
});
