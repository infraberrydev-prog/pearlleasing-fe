import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Radio } from './radio';
import { RadioGroup } from './radio-group';

@Component({
  imports: [Radio, RadioGroup, ReactiveFormsModule],
  template: `
    <app-radio-group [formControl]="control">
      <app-radio value="unpaid">Unpaid</app-radio>
      <app-radio value="paid">Paid</app-radio>
    </app-radio-group>
  `,
})
class Host {
  control = new FormControl('unpaid');
}

describe('RadioGroup', () => {
  it('checks the radio matching the control value and updates it on change', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [unpaid, paid] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('input'),
    );
    expect(unpaid.checked).toBe(true);
    expect(unpaid.name).toBe(paid.name);

    paid.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('paid');
    expect(paid.checked).toBe(true);
  });
});
