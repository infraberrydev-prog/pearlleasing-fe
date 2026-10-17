import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { interval, map } from 'rxjs';
import { authActions, authFeature } from '../../../core/auth';
import { Button, Icon, OtpInput } from '../../../shared/ui';
import { AuthLayout } from '../auth-layout/auth-layout';
import { OTP_ERRORS } from '../auth-messages';

const CODE_LENGTH = 6;

/**
 * Figma "2FA" (default 276:9347, countdown 14:519, error 276:8678 / 276:8758;
 * tablet 353:9080; mobile 361:10625).
 */
@Component({
  selector: 'app-two-factor',
  imports: [ReactiveFormsModule, AuthLayout, Button, Icon, OtpInput],
  templateUrl: './two-factor.html',
  styleUrl: './two-factor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoFactor {
  private readonly store = inject(Store);

  protected readonly codeLength = CODE_LENGTH;
  protected readonly code = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(CODE_LENGTH)],
  });

  protected readonly challenge = this.store.selectSignal(authFeature.selectChallenge);
  protected readonly pending = this.store.selectSignal(authFeature.selectPending);
  private readonly otpError = this.store.selectSignal(authFeature.selectOtpError);
  protected readonly errorMessage = computed(() => {
    const error = this.otpError();
    return error ? OTP_ERRORS[error] : null;
  });

  private readonly now = toSignal(interval(1000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });
  protected readonly resendIn = computed(() => {
    const availableAt = this.challenge()?.resendAvailableAt ?? 0;
    return Math.max(0, Math.ceil((availableAt - this.now()) / 1000));
  });

  protected verify(): void {
    if (this.pending() || this.code.invalid) return;
    this.store.dispatch(authActions.verifyOtp({ code: this.code.value }));
  }

  protected resend(): void {
    if (this.pending() || this.resendIn() > 0) return;
    this.code.reset();
    this.store.dispatch(authActions.resendOtp());
  }

  protected backToLogin(): void {
    this.store.dispatch(authActions.backToLogin());
  }
}
