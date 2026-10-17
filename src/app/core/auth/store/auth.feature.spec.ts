import { authActions } from './auth.actions';
import { authFeature, initialAuthState } from './auth.feature';

const reducer = authFeature.reducer;
const challenge = { challengeId: 'c1', maskedEmail: 'ma***@gmail.com', resendAvailableAt: 1 };
const session = { token: 't', user: { id: '1', username: 'u', displayName: 'U' } };

describe('auth reducer', () => {
  it('tracks the login request', () => {
    let state = reducer(initialAuthState, authActions.login({ credentials: { username: 'u', password: 'p' } }));
    expect(state.pending).toBe(true);

    state = reducer(state, authActions.loginFailed({ error: 'invalid_credentials' }));
    expect(state).toMatchObject({ pending: false, loginError: 'invalid_credentials' });

    state = reducer(state, authActions.login({ credentials: { username: 'u', password: 'p' } }));
    expect(state.loginError).toBeNull();

    state = reducer(state, authActions.loginSucceeded({ challenge }));
    expect(state).toMatchObject({ pending: false, challenge });
  });

  it('stores the session after the code is verified and drops the challenge', () => {
    let state = reducer(initialAuthState, authActions.loginSucceeded({ challenge }));
    state = reducer(state, authActions.verifyOtpFailed({ error: 'invalid_otp' }));
    expect(state.otpError).toBe('invalid_otp');

    state = reducer(state, authActions.verifyOtpSucceeded({ session }));
    expect(state).toEqual({ ...initialAuthState, session });
    expect(authFeature.selectIsAuthenticated.projector(state.session)).toBe(true);
  });

  it('resets on logout', () => {
    const state = reducer({ ...initialAuthState, session }, authActions.logout());
    expect(state).toEqual(initialAuthState);
  });
});
