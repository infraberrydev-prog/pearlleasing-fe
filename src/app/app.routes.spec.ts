import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialAuthState } from './core/auth';
import { routes } from './app.routes';

const session = { token: 't', user: { id: '1', username: 'u', displayName: 'U' } };

async function setup(signedIn: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      provideMockStore({ initialState: { auth: { ...initialAuthState, session: signedIn ? session : null } } }),
    ],
  });
  const harness = await RouterTestingHarness.create();
  return { harness, location: TestBed.inject(Location), store: TestBed.inject(MockStore) };
}

describe('app routes', () => {
  it('sends signed-out users to the login page, outside the shell', async () => {
    const { harness, location } = await setup(false);
    await harness.navigateByUrl('/leasing');
    expect(location.path()).toBe('/login');
    expect(harness.routeNativeElement?.querySelector('app-shell')).toBeNull();
    expect(document.querySelector('app-sidebar')).toBeNull();
  });

  it('renders app pages inside the shell and defaults to Leasing', async () => {
    const { harness, location } = await setup(true);
    const page = await harness.navigateByUrl('/');
    expect(location.path()).toBe('/leasing');
    expect(harness.fixture.nativeElement.querySelector('app-shell app-sidebar')).not.toBeNull();
    expect(harness.fixture.nativeElement.querySelector('app-shell h1')?.textContent).toBe(
      'Leasing Reports',
    );
    expect(page).toBeTruthy();

    await harness.navigateByUrl('/expenses');
    expect(harness.fixture.nativeElement.querySelector('app-shell h1')?.textContent).toBe(
      'Expenses Reports',
    );
  });

  it('keeps signed-in users out of the login page', async () => {
    const { harness, location } = await setup(true);
    await harness.navigateByUrl('/login');
    expect(location.path()).toBe('/leasing');
  });
});
