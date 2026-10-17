import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { LogoutService } from '../logout.service';
import { Sidebar } from '../sidebar/sidebar';

/**
 * Signed-in layout.
 * - Desktop / tablet: 72px icon rail; the toggle opens the 312px sidebar over the page
 *   with a backdrop (Figma 367:15213), closed by the toggle, the backdrop, Escape or navigating.
 * - Mobile: no sidebar; bottom navigation instead.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, CdkTrapFocus, Sidebar, BottomNav],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeSidebar()' },
})
export class Shell {
  private readonly logout = inject(LogoutService);

  protected readonly sidebarExpanded = signal(false);

  protected toggleSidebar(): void {
    this.sidebarExpanded.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarExpanded.set(false);
  }

  protected requestLogout(): void {
    this.closeSidebar();
    this.logout.confirmLogout();
  }
}
