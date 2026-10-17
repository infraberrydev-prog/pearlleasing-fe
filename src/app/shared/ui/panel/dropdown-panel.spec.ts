import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DropdownPanel } from './dropdown-panel';

@Component({
  imports: [DropdownPanel],
  template: `
    <button #trigger (click)="open.set(true)">Sort</button>
    <app-dropdown-panel [origin]="trigger" [(open)]="open" ariaLabel="Sort reports">
      <button class="inside">Apply</button>
    </app-dropdown-panel>
  `,
})
class Host {
  open = signal(false);
}

describe('DropdownPanel', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('opens under the trigger and closes on Escape', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(document.querySelector('.app-panel')).toBeNull();

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    fixture.detectChanges();
    const panel = document.querySelector('.app-panel')!;
    expect(panel.getAttribute('aria-label')).toBe('Sort reports');
    expect(panel.querySelector('.inside')).not.toBeNull();

    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
