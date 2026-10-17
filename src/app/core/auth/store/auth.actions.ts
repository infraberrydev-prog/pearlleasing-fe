import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthErrorCode, AuthSession, LoginCredentials, OtpChallenge } from '../auth.models';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ credentials: LoginCredentials }>(),
    'Login Succeeded': props<{ challenge: OtpChallenge }>(),
    'Login Failed': props<{ error: AuthErrorCode }>(),

    'Verify Otp': props<{ code: string }>(),
    'Verify Otp Succeeded': props<{ session: AuthSession }>(),
    'Verify Otp Failed': props<{ error: AuthErrorCode }>(),

    'Resend Otp': emptyProps(),
    'Resend Otp Succeeded': props<{ challenge: OtpChallenge }>(),
    'Resend Otp Failed': props<{ error: AuthErrorCode }>(),

    'Back To Login': emptyProps(),
    'Session Restored': props<{ session: AuthSession }>(),
    'Session Expired': emptyProps(),
    Logout: emptyProps(),
  },
});
