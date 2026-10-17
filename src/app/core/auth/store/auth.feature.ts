import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { AuthErrorCode, AuthSession, OtpChallenge } from '../auth.models';
import { authActions } from './auth.actions';

export interface AuthState {
  session: AuthSession | null;
  challenge: OtpChallenge | null;
  pending: boolean;
  loginError: AuthErrorCode | null;
  otpError: AuthErrorCode | null;
}

export const initialAuthState: AuthState = {
  session: null,
  challenge: null,
  pending: false,
  loginError: null,
  otpError: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,
    on(authActions.login, (state) => ({ ...state, pending: true, loginError: null })),
    on(authActions.loginSucceeded, (state, { challenge }) => ({
      ...state,
      pending: false,
      challenge,
      otpError: null,
    })),
    on(authActions.loginFailed, (state, { error }) => ({ ...state, pending: false, loginError: error })),

    on(authActions.verifyOtp, (state) => ({ ...state, pending: true, otpError: null })),
    on(authActions.verifyOtpSucceeded, authActions.sessionRestored, (state, { session }) => ({
      ...initialAuthState,
      session,
    })),
    on(authActions.verifyOtpFailed, (state, { error }) => ({ ...state, pending: false, otpError: error })),

    on(authActions.resendOtp, (state) => ({ ...state, pending: true })),
    on(authActions.resendOtpSucceeded, (state, { challenge }) => ({
      ...state,
      pending: false,
      challenge,
      otpError: null,
    })),
    on(authActions.resendOtpFailed, (state, { error }) => ({ ...state, pending: false, otpError: error })),

    on(authActions.backToLogin, authActions.logout, authActions.sessionExpired, () => initialAuthState),
  ),
  extraSelectors: ({ selectSession }) => ({
    selectIsAuthenticated: createSelector(selectSession, (session) => !!session),
    selectToken: createSelector(selectSession, (session) => session?.token ?? null),
    selectUser: createSelector(selectSession, (session) => session?.user ?? null),
  }),
});
