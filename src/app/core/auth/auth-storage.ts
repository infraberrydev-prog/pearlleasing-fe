import { Injectable } from '@angular/core';
import { AuthSession } from './auth.models';

const KEY = 'pearl.auth.session';

/** Keeps the session across reloads within the tab (sessionStorage). */
@Injectable({ providedIn: 'root' })
export class AuthStorage {
  read(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  write(session: AuthSession): void {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable (private mode); the session just won't survive a reload.
    }
  }

  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }
}
