import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { authActions, initialAuthState } from '../../core/auth';
import { Shell } from './shell';

@Component({ template: '<p class="page">page</p>' })
class Page {}

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'leasing', component: Page },
        { path: 'expenses', component: Page },
        { path: 'more', component: Page },
      ]),
      provideMockStore({ initialState: { auth: initialAuthState } }),
    ],
  });
  const fixture = TestBed.createComponent(Shell);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');
  const sidebar = () => el.querySelector('app-sidebar')!;
  const toggle = () => el.querySelector<HTMLButtonElement>('app-sidebar .toggle')!;
  return { fixture, el, dispatch, sidebar, toggle };
}

describe('Shell', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('starts with the collapsed rail: no labels, accessible names on the links', () => {
    const { el, sidebar } = setup();
    expect(sidebar().classList).not.toContain('is-expanded');
    expect(el.querySelector('app-sidebar .label')).toBeNull();
    const links = Array.from(el.querySelectorAll('app-sidebar nav a'));
    expect(links.map((a) => a.getAttribute('aria-label'))).toEqual([
      'Leasing Reports',
      'Expenses Reports',
    ]);
  });

  it('expands over the page with a backdrop and collapses again', () => {
    const { fixture, el, sidebar, toggle } = setup();
    toggle().click();
    fixture.detectChanges();
    expect(sidebar().classList).toContain('is-expanded');
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.backdrop')).not.toBeNull();
    expect(Array.from(el.querySelectorAll('app-sidebar .label')).map((l) => l.textContent)).toEqual([
      'Leasing Reports',
      'Expenses Reports',
      'Log out',
    ]);

    (el.querySelector('.backdrop') as HTMLElement).click();
    fixture.detectChanges();
    expect(sidebar().classList).not.toContain('is-expanded');
  });

  it('closes the expanded sidebar on Escape', () => {
    const { fixture, sidebar, toggle } = setup();
    toggle().click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(sidebar().classList).not.toContain('is-expanded');
  });

  it('asks for confirmation before logging out', () => {
    const { el, dispatch } = setup();
    const logoutButton = Array.from(el.querySelectorAll<HTMLButtonElement>('app-sidebar button')).at(-1)!;
    logoutButton.click();
    TestBed.tick();

    const pane = document.querySelector('.cdk-overlay-pane')!;
    expect(pane.querySelector('h2')!.textContent).toContain('Are you sure you want to log out?');
    const [cancel, confirm] = Array.from(pane.querySelectorAll<HTMLButtonElement>('.actions button'));
    expect(confirm.textContent?.trim()).toBe('Log out');

    cancel.click();
    expect(dispatch).not.toHaveBeenCalled();

    logoutButton.click();
    TestBed.tick();
    Array.from(document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-pane .actions button')).at(-1)!.click();
    expect(dispatch).toHaveBeenCalledWith(authActions.logout());
  });

  it('renders the mobile bottom nav with Leasing, Expenses and More', () => {
    const { el } = setup();
    const tabs = Array.from(el.querySelectorAll('app-bottom-nav a')).map((a) => a.textContent?.trim());
    expect(tabs).toEqual(['Leasing Reports', 'Expenses Reports', 'More']);
  });
});
