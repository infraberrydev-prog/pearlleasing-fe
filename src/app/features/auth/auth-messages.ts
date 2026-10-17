import { AuthErrorCode } from '../../core/auth';

/** Copy from the Figma error states; `unknown` has no design and is a placeholder. */
export const LOGIN_ERRORS: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Incorrect username or password.',
  invalid_otp: 'Incorrect username or password.',
  unknown: 'Something went wrong. Please try again.',
};

export const OTP_ERRORS: Record<AuthErrorCode, string> = {
  invalid_otp: 'The 6-digit code is incorrect or expired. Please try again.',
  invalid_credentials: 'The 6-digit code is incorrect or expired. Please try again.',
  unknown: 'Something went wrong. Please try again.',
};
