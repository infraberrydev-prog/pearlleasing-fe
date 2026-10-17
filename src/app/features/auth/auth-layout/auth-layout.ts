import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { AuthIllustration } from '../auth-illustration/auth-illustration';

/**
 * Page frame for the auth screens.
 * Desktop with `showIntro` (login): blue intro panel + illustration on the left, form on the right.
 * Otherwise (2FA, tablet, mobile): form centred over the faint background pattern.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [AuthIllustration],
  template: `
    @if (showIntro()) {
      <aside class="intro">
        <div class="intro-text">
          <h2 class="intro-title">Effortlessly manage your reports and operations</h2>
          <p class="intro-subtitle">Log in to manage your report and operations.</p>
        </div>
        <app-auth-illustration class="illustration" />
      </aside>
    }
    <main class="form-panel">
      <div class="form-container"><ng-content /></div>
    </main>
  `,
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.with-intro]': 'showIntro()' },
})
export class AuthLayout {
  readonly showIntro = input(false, { transform: booleanAttribute });
}
