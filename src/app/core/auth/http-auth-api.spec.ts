import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config';
import { AuthError } from './auth.models';
import { HttpAuthApi, userFromToken } from './http-auth-api';

// Header.payload.signature with payload {"nameid":"2","unique_name":"jhumell.brao","role":"Admin"}.
const TOKEN = `x.${btoa(JSON.stringify({ nameid: '2', unique_name: 'jhumell.brao', role: 'Admin' }))
  .replace(/=+$/, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')}.sig`;

const badRequest = { status: 400, statusText: 'Bad Request' };

function setup() {
  TestBed.configureTestingModule({
    providers: [
      HttpAuthApi,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '/api' },
    ],
  });
  return { api: TestBed.inject(HttpAuthApi), http: TestBed.inject(HttpTestingController) };
}

describe('HttpAuthApi', () => {
  it('logs in and turns the response into an OTP challenge', async () => {
    const { api, http } = setup();
    const result = firstValueFrom(api.login({ username: 'jhumell.brao', password: 'secret123' }));
    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'jhumell.brao', password: 'secret123' });
    req.flush({ data: { message: 'OTP sent', emailHint: 'pr******@gmail.com', userId: 2 }, message: 'OTP sent' });

    expect(await result).toMatchObject({ challengeId: '2', maskedEmail: 'pr******@gmail.com' });
  });

  it('maps a rejected login to invalid_credentials and server errors to unknown', async () => {
    const { api, http } = setup();
    const wrong = firstValueFrom(api.login({ username: 'a', password: 'b' }));
    http.expectOne('/api/auth/login').flush({ statusCode: 400, errorType: 'VE005', message: 'Incorrect' }, badRequest);
    await expect(wrong).rejects.toEqual(new AuthError('invalid_credentials'));

    const down = firstValueFrom(api.login({ username: 'a', password: 'b' }));
    http.expectOne('/api/auth/login').flush(null, { status: 500, statusText: 'Server Error' });
    await expect(down).rejects.toEqual(new AuthError('unknown'));
  });

  it('verifies the code and reads the user from the token', async () => {
    const { api, http } = setup();
    const result = firstValueFrom(api.verifyOtp('2', '808763'));
    const req = http.expectOne('/api/auth/verify-otp');
    expect(req.request.body).toEqual({ userId: 2, otpCode: '808763' });
    req.flush({ data: { accessToken: TOKEN, refreshToken: 'refresh' }, message: 'Login Successful!' });

    expect(await result).toEqual({
      token: TOKEN,
      refreshToken: 'refresh',
      user: { id: '2', username: 'jhumell.brao', displayName: 'jhumell.brao' },
    });
  });

  it('maps a wrong code to invalid_otp', async () => {
    const { api, http } = setup();
    const result = firstValueFrom(api.verifyOtp('2', '000000'));
    http.expectOne('/api/auth/verify-otp').flush({ statusCode: 400, message: 'Invalid OTP' }, badRequest);
    await expect(result).rejects.toEqual(new AuthError('invalid_otp'));
  });

  it('resends the code by logging in again with the same credentials', async () => {
    const { api, http } = setup();
    const first = firstValueFrom(api.login({ username: 'jhumell.brao', password: 'secret123' }));
    http.expectOne('/api/auth/login').flush({ data: { message: '', emailHint: 'pr***', userId: 2 }, message: '' });
    await first;

    const resent = firstValueFrom(api.resendOtp());
    const req = http.expectOne('/api/auth/login');
    expect(req.request.body).toEqual({ username: 'jhumell.brao', password: 'secret123' });
    req.flush({ data: { message: '', emailHint: 'pr***', userId: 2 }, message: '' });
    expect((await resent).challengeId).toBe('2');
  });

  it('sends the token with logout', () => {
    const { api, http } = setup();
    api.logout('abc').subscribe();
    const req = http.expectOne('/api/auth/logout');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush(null);
  });

  it('falls back to an empty user for a malformed token', () => {
    expect(userFromToken('not-a-jwt').username).toBe('');
  });
});
