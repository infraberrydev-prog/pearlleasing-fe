import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OtpInput } from './otp-input';

@Component({
  imports: [OtpInput, ReactiveFormsModule],
  template: `<app-otp-input [formControl]="control" (completed)="completed = $event" />`,
})
class Host {
  control = new FormControl('');
  completed: string | null = null;
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const boxes = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input'),
  );
  const type = (index: number, value: string) => {
    boxes[index].value = value;
    boxes[index].dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  return { fixture, boxes, type };
}

describe('OtpInput', () => {
  it('renders six boxes', () => {
    expect(setup().boxes.length).toBe(6);
  });

  it('advances focus while typing and reports the value', () => {
    const { fixture, boxes, type } = setup();
    type(0, '8');
    expect(document.activeElement).toBe(boxes[1]);
    type(1, '2');
    expect(fixture.componentInstance.control.value).toBe('82');
  });

  it('ignores non-digits', () => {
    const { fixture, type } = setup();
    type(0, 'a');
    expect(fixture.componentInstance.control.value).toBe('');
  });

  it('fills every box from a paste and emits completed', () => {
    const { fixture, boxes } = setup();
    const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '825 128' } });
    boxes[0].dispatchEvent(paste);
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('825128');
    expect(boxes.map((b) => b.value).join('')).toBe('825128');
    expect(fixture.componentInstance.completed).toBe('825128');
  });

  it('clears the previous box on Backspace in an empty box', () => {
    const { fixture, boxes, type } = setup();
    type(0, '8');
    type(1, '2');
    boxes[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('8');
    expect(document.activeElement).toBe(boxes[1]);
  });

  it('shows values written by the form', () => {
    const { fixture, boxes } = setup();
    fixture.componentInstance.control.setValue('123');
    fixture.detectChanges();
    expect(boxes.slice(0, 3).map((b) => b.value)).toEqual(['1', '2', '3']);
    expect(boxes[3].value).toBe('');
  });
});
