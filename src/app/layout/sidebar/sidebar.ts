import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/ui';
import { NAV_ITEMS } from '../nav-items';

/**
 * Figma "Sidebar". Collapsed: 72px icon rail (Figma frame "Uncollapsed - Sidebar" 367:15039).
 * Expanded: 312px panel with logo and labels (Figma frame "Collapsed - Sidebar" 367:15213).
 * The frame names in Figma are swapped; these follow what each frame shows.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'complementary', 'aria-label': 'Sidebar', '[class.is-expanded]': 'expanded()' },
})
export class Sidebar {
  readonly expanded = input(false, { transform: booleanAttribute });
  readonly toggled = output<void>();
  readonly navigated = output<void>();
  readonly logoutRequested = output<void>();

  protected readonly items = NAV_ITEMS;
}
