import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { authActions, authFeature } from '../../../core/auth';
import { Alert, Button, InputField } from '../../../shared/ui';
import { AuthLayout } from '../auth-layout/auth-layout';
import { LOGIN_ERRORS } from '../auth-messages';

/** Figma "Login Form" (default 276:8858, filled 13:157, error 274:7357; tablet 353:5797; mobile 361:9951). */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AuthLayout, Alert, Button, InputField],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly store = inject(Store);

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly pending = this.store.selectSignal(authFeature.selectPending);
  private readonly loginError = this.store.selectSignal(authFeature.selectLoginError);
  protected readonly errorMessage = computed(() => {
    const error = this.loginError();
    return error ? LOGIN_ERRORS[error] : null;
  });

  protected fieldError(name: 'username' | 'password', label: string): string | null {
    const control = this.form.controls[name];
    return control.touched && control.hasError('required') ? `${label} is required.` : null;
  }

  protected submit(): void {
    if (this.pending()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(authActions.login({ credentials: this.form.getRawValue() }));
  }
}
