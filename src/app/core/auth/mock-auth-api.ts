import { Injectable } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import { AuthApi } from './auth-api';
import { AuthError, AuthSession, LoginCredentials, OtpChallenge } from './auth.models';

export const MOCK_PASSWORD = 'password';
export const MOCK_OTP = '123456';
export const RESEND_COOLDOWN_MS = 59_000;
const LATENCY_MS = 600;

/**
 * In-memory stand-in for the auth backend.
 * Any username works with password "password"; the verification code is "123456".
 */
@Injectable()
export class MockAuthApi extends AuthApi {
  private username = '';

  login({ username, password }: LoginCredentials): Observable<OtpChallenge> {
    return defer(() => {
      if (password !== MOCK_PASSWORD) return throwError(() => new AuthError('invalid_credentials'));
      this.username = username;
      return of(this.challenge());
    }).pipe(delay(LATENCY_MS));
  }

  verifyOtp(_challengeId: string, code: string): Observable<AuthSession> {
    return defer(() =>
      code === MOCK_OTP
        ? of({
            token: `mock-token-${Date.now()}`,
            user: { id: '1', username: this.username, displayName: this.username },
          })
        : throwError(() => new AuthError('invalid_otp')),
    ).pipe(delay(LATENCY_MS));
  }

  resendOtp(): Observable<OtpChallenge> {
    return defer(() => of(this.challenge())).pipe(delay(LATENCY_MS));
  }

  private challenge(): OtpChallenge {
    return {
      challengeId: 'mock-challenge',
      maskedEmail: 'ma******@gmail.com',
      resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS,
    };
  }
}
