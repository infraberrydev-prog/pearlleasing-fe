import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { authActions, initialAuthState } from '../../../core/auth';
import { Login } from './login';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideMockStore({ initialState: { auth: initialAuthState } })],
  });
  const store = TestBed.inject(MockStore);
  const dispatch = vi.spyOn(store, 'dispatch');
  const fixture = TestBed.createComponent(Login);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const inputs = el.querySelectorAll<HTMLInputElement>('app-input-field input');
  const type = (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };
  return { fixture, el, store, dispatch, username: inputs[0], password: inputs[1], type, submit };
}

describe('Login page', () => {
  it('shows required errors instead of submitting an empty form', () => {
    const { el, dispatch, submit } = setup();
    submit();
    expect(dispatch).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Username is required.');
    expect(el.textContent).toContain('Password is required.');
  });

  it('dispatches login with the entered credentials', () => {
    const { dispatch, username, password, type, submit } = setup();
    type(username, 'userpearl02');
    type(password, 'password');
    submit();
    expect(dispatch).toHaveBeenCalledWith(
      authActions.login({ credentials: { username: 'userpearl02', password: 'password' } }),
    );
  });

  it('shows the Figma error alert for wrong credentials', () => {
    const { fixture, el, store } = setup();
    store.setState({ auth: { ...initialAuthState, loginError: 'invalid_credentials' } });
    fixture.detectChanges();
    expect(el.querySelector('app-alert')!.textContent).toContain('Incorrect username or password.');
  });

  it('disables the button while the request is pending', () => {
    const { fixture, el, store } = setup();
    store.setState({ auth: { ...initialAuthState, pending: true } });
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
  });
});
