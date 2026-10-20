import { Observable } from 'rxjs';
import { AuthSession, LoginCredentials, OtpChallenge } from './auth.models';

/**
 * Backend contract for login + 2FA. Fails with `AuthError` for expected errors.
 * `HttpAuthApi` talks to the backend; `MockAuthApi` is used when environment.useMocks is on.
 */
export abstract class AuthApi {
  abstract login(credentials: LoginCredentials): Observable<OtpChallenge>;
  abstract verifyOtp(challengeId: string, code: string): Observable<AuthSession>;
  abstract resendOtp(challengeId: string): Observable<OtpChallenge>;
  /** Ends the session on the server; the app signs out locally either way. */
  abstract logout(token: string): Observable<void>;
}
