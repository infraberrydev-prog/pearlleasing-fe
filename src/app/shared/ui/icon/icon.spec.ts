import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

@Component({
  imports: [Icon],
  template: `<app-icon name="logout-02">LO</app-icon>`,
})
class Host {}

describe('Icon', () => {
  it('loads the SVG from public/icons', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img')!;
    expect(img.getAttribute('src')).toBe('icons/logout-02.svg');
  });

  it('shows the fallback content when the SVG is missing', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent?.trim()).toBe('LO');
  });
});
