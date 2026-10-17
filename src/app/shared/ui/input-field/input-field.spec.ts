import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputField } from './input-field';

@Component({
  imports: [InputField, ReactiveFormsModule],
  template: `<app-input-field label="Password" type="password" [error]="error()" [formControl]="control" />`,
})
class Host {
  control = new FormControl('initial');
  error = signal<string | null>(null);
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, input: el.querySelector('input')! };
}

describe('InputField', () => {
  it('links the label to the input', () => {
    const { el, input } = setup();
    expect(el.querySelector('label')!.getAttribute('for')).toBe(input.id);
  });

  it('syncs value both ways with a FormControl', () => {
    const { fixture, input } = setup();
    expect(input.value).toBe('initial');

    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('typed');

    fixture.componentInstance.control.setValue('from form');
    fixture.detectChanges();
    expect(input.value).toBe('from form');
  });

  it('toggles password visibility', () => {
    const { fixture, el, input } = setup();
    const toggle = el.querySelector<HTMLButtonElement>('button.toggle')!;
    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');

    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the error and marks the input invalid', () => {
    const { fixture, el, input } = setup();
    fixture.componentInstance.error.set('Incorrect username or password.');
    fixture.detectChanges();

    const message = el.querySelector('.message--error')!;
    expect(message.textContent).toContain('Incorrect username or password.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
  });

  it('disables the input when the control is disabled', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});

@Component({
  imports: [InputField],
  template: `
    <app-input-field prefix="₱" placeholder="00.00" ariaLabel="Minimum amount" />
    <app-input-field label="Water" required ariaLabel="ignored when there is a label" />
    <app-input-field label="TIN No." optional />
  `,
})
class MarkersHost {}

describe('InputField markers', () => {
  it('shows a prefix, names unlabelled inputs and marks required/optional labels', () => {
    const fixture = TestBed.createComponent(MarkersHost);
    fixture.detectChanges();
    const [amount, water, tin] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('app-input-field'));
    expect(amount.querySelector('.prefix')!.textContent).toBe('₱');
    expect(amount.querySelector('input')!.getAttribute('aria-label')).toBe('Minimum amount');
    expect(water.querySelector('input')!.hasAttribute('aria-label')).toBe(false);
    expect(water.querySelector('.required')!.textContent).toBe('*');
    expect(tin.querySelector('.optional')!.textContent).toBe('(optional)');
  });
});
