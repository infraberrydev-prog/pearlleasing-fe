import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Alert } from './alert';

@Component({
  imports: [Alert],
  template: `<app-alert tone="success" dismissible (dismissed)="dismissed = true">Saved</app-alert>`,
})
class Host {
  dismissed = false;
}

describe('Alert', () => {
  it('uses status role for success and emits dismissed on close', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-alert')!.getAttribute('role')).toBe('status');

    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(fixture.componentInstance.dismissed).toBe(true);
  });
});
