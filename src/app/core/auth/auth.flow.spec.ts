import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { Store, provideStore } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { USE_MOCK_APIS } from '../config';
import { authInterceptor } from './auth.interceptor';
import { authGuard, guestGuard, otpChallengeGuard } from './auth.guards';
import { provideAuth } from './auth.providers';
import { MOCK_OTP, MOCK_PASSWORD } from './mock-auth-api';
import { authActions } from './store/auth.actions';
import { authFeature } from './store/auth.feature';

const LATENCY = 600;

function setup() {
  vi.useFakeTimers();
  sessionStorage.clear();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', children: [] }]),
      provideStore(),
      provideEffects(),
      provideAuth(),
      { provide: USE_MOCK_APIS, useValue: true },
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  const store = TestBed.inject(Store);
  const router = TestBed.inject(Router);
  const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  const select = <T>(selector: (s: object) => T) => store.selectSignal(selector)();
  return { store, router, navigate, select };
}

async function signIn(store: Store) {
  store.dispatch(authActions.login({ credentials: { username: 'pearl', password: MOCK_PASSWORD } }));
  await vi.advanceTimersByTimeAsync(LATENCY);
  store.dispatch(authActions.verifyOtp({ code: MOCK_OTP }));
  await vi.advanceTimersByTimeAsync(LATENCY);
}

describe('auth flow (mock API + effects)', () => {
  afterEach(() => vi.useRealTimers());

  it('goes to the 2FA page after a correct password', async () => {
    const { store, navigate, select } = setup();
    store.dispatch(authActions.login({ credentials: { username: 'pearl', password: MOCK_PASSWORD } }));
    await vi.advanceTimersByTimeAsync(LATENCY);

    expect(select(authFeature.selectChallenge)?.maskedEmail).toBe('ma******@gmail.com');
    expect(navigate).toHaveBeenCalledWith('/login/verify');
  });

  it('reports a wrong password', async () => {
    const { store, navigate, select } = setup();
    store.dispatch(authActions.login({ credentials: { username: 'pearl', password: 'nope' } }));
    await vi.advanceTimersByTimeAsync(LATENCY);

    expect(select(authFeature.selectLoginError)).toBe('invalid_credentials');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('signs in with the right code, saves the session and goes home', async () => {
    const { store, navigate, select } = setup();
    await signIn(store);

    expect(select(authFeature.selectIsAuthenticated)).toBe(true);
    expect(sessionStorage.getItem('pearl.auth.session')).toContain('mock-token');
    expect(navigate).toHaveBeenLastCalledWith('/');
  });

  it('reports a wrong code', async () => {
    const { store, select } = setup();
    store.dispatch(authActions.login({ credentials: { username: 'pearl', password: MOCK_PASSWORD } }));
    await vi.advanceTimersByTimeAsync(LATENCY);
    store.dispatch(authActions.verifyOtp({ code: '000000' }));
    await vi.advanceTimersByTimeAsync(LATENCY);

    expect(select(authFeature.selectOtpError)).toBe('invalid_otp');
    expect(select(authFeature.selectIsAuthenticated)).toBe(false);
  });

  it('logout clears the session and returns to login', async () => {
    const { store, navigate, select } = setup();
    await signIn(store);
    store.dispatch(authActions.logout());

    expect(select(authFeature.selectIsAuthenticated)).toBe(false);
    expect(sessionStorage.getItem('pearl.auth.session')).toBeNull();
    expect(navigate).toHaveBeenLastCalledWith('/login');
  });

  it('guards routes by sign-in state', async () => {
    const { store, router } = setup();
    const run = (guard: typeof authGuard) =>
      TestBed.runInInjectionContext(() => guard({} as never, {} as never));
    const url = (result: unknown) => (typeof result === 'boolean' ? result : router.serializeUrl(result as never));

    expect(url(run(authGuard))).toBe('/login');
    expect(url(run(guestGuard))).toBe(true);
    expect(url(run(otpChallengeGuard))).toBe('/login');

    store.dispatch(authActions.login({ credentials: { username: 'pearl', password: MOCK_PASSWORD } }));
    await vi.advanceTimersByTimeAsync(LATENCY);
    expect(url(run(otpChallengeGuard))).toBe(true);

    store.dispatch(authActions.verifyOtp({ code: MOCK_OTP }));
    await vi.advanceTimersByTimeAsync(LATENCY);
    expect(url(run(authGuard))).toBe(true);
    expect(url(run(guestGuard))).toBe('/');
    expect(url(run(otpChallengeGuard))).toBe('/');
  });

  it('adds the bearer token and expires the session on 401', async () => {
    const { store, select } = setup();
    await signIn(store);
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);

    const response = firstValueFrom(http.get('/api/reports')).catch((e) => e);
    const req = backend.expectOne('/api/reports');
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer mock-token-/);
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
    await response;

    expect(select(authFeature.selectIsAuthenticated)).toBe(false);
  });
});
