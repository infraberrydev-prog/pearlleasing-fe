import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../config';
import { AuthApi } from './auth-api';
import { AuthError, AuthErrorCode, AuthSession, LoginCredentials, OtpChallenge, User } from './auth.models';
import { RESEND_COOLDOWN_MS } from './mock-auth-api';

interface LoginResponse {
  data: { message: string; emailHint: string; userId: number };
  message: string;
}

interface TokenResponse {
  data: { accessToken: string; refreshToken: string };
  message: string;
}

/** Real auth backend: POST /api/auth/login, then /api/auth/verify-otp with the emailed code. */
@Injectable()
export class HttpAuthApi extends AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/auth`;
  /** Kept in memory only: the API has no resend endpoint, so "Resend Code" logs in again. */
  private credentials: LoginCredentials | null = null;

  login(credentials: LoginCredentials): Observable<OtpChallenge> {
    return this.http.post<LoginResponse>(`${this.base}/login`, credentials).pipe(
      map(({ data }) => {
        this.credentials = credentials;
        return {
          challengeId: String(data.userId),
          maskedEmail: data.emailHint,
          resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS,
        };
      }),
      catchError((error) => throwError(() => toAuthError(error, 'invalid_credentials'))),
    );
  }

  verifyOtp(challengeId: string, code: string): Observable<AuthSession> {
    return this.http
      .post<TokenResponse>(`${this.base}/verify-otp`, { userId: Number(challengeId), otpCode: code })
      .pipe(
        map(({ data }) => {
          this.credentials = null;
          return { token: data.accessToken, refreshToken: data.refreshToken, user: userFromToken(data.accessToken) };
        }),
        catchError((error) => throwError(() => toAuthError(error, 'invalid_otp'))),
      );
  }

  resendOtp(): Observable<OtpChallenge> {
    return this.credentials
      ? this.login(this.credentials)
      : throwError(() => new AuthError('unknown'));
  }

  logout(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, null, { headers: { Authorization: `Bearer ${token}` } });
  }
}

/** 400 means the user's input was rejected (wrong password, wrong code); anything else is unexpected. */
function toAuthError(error: unknown, onBadRequest: AuthErrorCode): AuthError {
  return new AuthError(error instanceof HttpErrorResponse && error.status === 400 ? onBadRequest : 'unknown');
}

/** Reads the user from the JWT claims (nameid, unique_name). */
export function userFromToken(token: string): User {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, string>;
    const username = claims['unique_name'] ?? '';
    return { id: String(claims['nameid'] ?? ''), username, displayName: username };
  } catch {
    return { id: '', username: '', displayName: '' };
  }
}
