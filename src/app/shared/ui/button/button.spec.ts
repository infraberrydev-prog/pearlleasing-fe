import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `<button app-button variant="danger" size="sm" block>Delete</button>`,
})
class Host {}

describe('Button', () => {
  it('applies variant, size and block classes to the native button', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.classList).toContain('app-button--danger');
    expect(button.classList).toContain('app-button--sm');
    expect(button.classList).toContain('app-button--block');
    expect(button.textContent?.trim()).toBe('Delete');
  });
});
