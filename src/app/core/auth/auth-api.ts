import { Observable } from 'rxjs';
import { AuthSession, LoginCredentials, OtpChallenge } from './auth.models';

/**
 * Backend contract for login + 2FA. Fails with `AuthError` for expected errors.
 * Only `MockAuthApi` exists until the real endpoints are known (docs/figma-plan.md, open question 2).
 */
export abstract class AuthApi {
  abstract login(credentials: LoginCredentials): Observable<OtpChallenge>;
  abstract verifyOtp(challengeId: string, code: string): Observable<AuthSession>;
  abstract resendOtp(challengeId: string): Observable<OtpChallenge>;
}
