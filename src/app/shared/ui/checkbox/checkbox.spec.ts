import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from './checkbox';

@Component({
  imports: [Checkbox, ReactiveFormsModule],
  template: `<app-checkbox [formControl]="control">Remember me</app-checkbox>`,
})
class Host {
  control = new FormControl(false);
}

describe('Checkbox', () => {
  it('syncs with a FormControl', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.checked).toBe(false);

    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);

    fixture.componentInstance.control.setValue(false);
    fixture.detectChanges();
    expect(input.checked).toBe(false);
  });
});
