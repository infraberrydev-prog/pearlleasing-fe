import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AuthState, authActions, initialAuthState } from '../../../core/auth';
import { TwoFactor } from './two-factor';

const NOW = new Date('2026-10-17T08:00:00Z').getTime();

function setup(auth: Partial<AuthState> = {}) {
  vi.useFakeTimers({ now: NOW });
  TestBed.configureTestingModule({
    providers: [
      provideMockStore({
        initialState: {
          auth: {
            ...initialAuthState,
            challenge: {
              challengeId: 'c1',
              maskedEmail: 'ma******@gmail.com',
              resendAvailableAt: NOW + 59_000,
            },
            ...auth,
          },
        },
      }),
    ],
  });
  const store = TestBed.inject(MockStore);
  const dispatch = vi.spyOn(store, 'dispatch');
  const fixture = TestBed.createComponent(TwoFactor);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, store, dispatch };
}

function enterCode(el: HTMLElement, code: string) {
  const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
  Object.defineProperty(paste, 'clipboardData', { value: { getData: () => code } });
  el.querySelector('app-otp-input input')!.dispatchEvent(paste);
}

describe('Two-factor page', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the masked email', () => {
    const { el } = setup();
    expect(el.querySelector('.subtitle')!.textContent).toContain('ma******@gmail.com');
  });

  it('enables Verify only with a full code and dispatches it', () => {
    const { fixture, el, dispatch } = setup();
    const verify = el.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(verify.disabled).toBe(true);

    enterCode(el, '123456');
    fixture.detectChanges();
    expect(verify.disabled).toBe(false);

    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(dispatch).toHaveBeenCalledWith(authActions.verifyOtp({ code: '123456' }));
  });

  it('counts down before Resend Code becomes available', async () => {
    const { fixture, el, dispatch } = setup();
    expect(el.querySelector('.resend')!.textContent).toContain('Resend in 59s');

    await vi.advanceTimersByTimeAsync(59_000);
    fixture.detectChanges();
    const resend = el.querySelector<HTMLButtonElement>('.resend-link')!;
    expect(resend.textContent).toContain('Resend Code');

    resend.click();
    expect(dispatch).toHaveBeenCalledWith(authActions.resendOtp());
  });

  it('shows the Figma error message for a wrong code', () => {
    const { el } = setup({ otpError: 'invalid_otp' });
    expect(el.querySelector('app-otp-input .error')!.textContent).toContain(
      'The 6-digit code is incorrect or expired. Please try again.',
    );
  });

  it('goes back to login', () => {
    const { el, dispatch } = setup();
    const back = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Back to log in'),
    )!;
    back.click();
    expect(dispatch).toHaveBeenCalledWith(authActions.backToLogin());
  });
});
