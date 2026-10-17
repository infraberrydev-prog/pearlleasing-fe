export interface User {
  id: string;
  username: string;
  displayName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

/** Issued after a correct username/password; the user must then enter the emailed code. */
export interface OtpChallenge {
  challengeId: string;
  /** e.g. "ma******@gmail.com" — shown on the 2FA screen. */
  maskedEmail: string;
  /** Epoch ms when "Resend Code" becomes available again. */
  resendAvailableAt: number;
}

export interface AuthSession {
  token: string;
  user: User;
}

export type AuthErrorCode = 'invalid_credentials' | 'invalid_otp' | 'unknown';

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}
