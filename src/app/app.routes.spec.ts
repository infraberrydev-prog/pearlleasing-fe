import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideEffects } from '@ngrx/effects';
import { Store, provideState, provideStore } from '@ngrx/store';
import { authActions, authFeature } from './core/auth';
import { routes } from './app.routes';

const session = { token: 't', user: { id: '1', username: 'u', displayName: 'U' } };

async function setup(signedIn: boolean) {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), provideStore(), provideEffects(), provideState(authFeature)],
  });
  if (signedIn) TestBed.inject(Store).dispatch(authActions.sessionRestored({ session }));
  const harness = await RouterTestingHarness.create();
  return { harness, location: TestBed.inject(Location) };
}

describe('app routes', () => {
  it('sends signed-out users to the login page, outside the shell', async () => {
    const { harness, location } = await setup(false);
    await harness.navigateByUrl('/leasing');
    expect(location.path()).toBe('/login');
    expect(harness.fixture.nativeElement.querySelector('app-shell')).toBeNull();
  });

  it('renders app pages inside the shell and defaults to Leasing', async () => {
    const { harness, location } = await setup(true);
    await harness.navigateByUrl('/');
    expect(location.path()).toBe('/leasing');
    const el = harness.fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-shell app-sidebar')).not.toBeNull();
    expect(el.querySelector('app-shell h1')?.textContent).toBe('Leasing Reports');
    expect(el.querySelector('app-shell app-report-list')).not.toBeNull();

    await harness.navigateByUrl('/expenses');
    expect(el.querySelector('app-shell h1')?.textContent).toBe('Expenses Reports');
  });

  it('keeps signed-in users out of the login page', async () => {
    const { harness, location } = await setup(true);
    await harness.navigateByUrl('/login');
    expect(location.path()).toBe('/leasing');
  });
});
