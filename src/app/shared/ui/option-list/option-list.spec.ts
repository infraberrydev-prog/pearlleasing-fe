import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OptionList } from './option-list';

@Component({
  imports: [OptionList, ReactiveFormsModule],
  template: `<app-option-list [options]="options" [formControl]="sort" />`,
})
class Host {
  options = [
    { value: 'revenue-desc', label: 'Expected Revenue: Highest first' },
    { value: 'revenue-asc', label: 'Expected Revenue: Lowest first' },
  ];
  sort = new FormControl<string | null>('revenue-asc');
}

describe('OptionList', () => {
  it('renders one radio per option and syncs with the form', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const radios = Array.from(el.querySelectorAll<HTMLInputElement>('input[type=radio]'));

    expect(el.textContent).toContain('Expected Revenue: Highest first');
    expect(radios[1].checked).toBe(true);

    radios[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sort.value).toBe('revenue-desc');
  });
});
