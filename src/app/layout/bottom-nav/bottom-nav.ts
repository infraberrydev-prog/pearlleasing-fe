import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/ui';
import { MOBILE_NAV_ITEMS } from '../nav-items';

/** Figma "Bottom navigation" (mobile, 390×68). Tab contents are inferred: the instance wasn't inspectable. */
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    @for (item of items; track item.path) {
      <a
        class="tab"
        [routerLink]="item.path"
        routerLinkActive="is-active"
        ariaCurrentWhenActive="page"
      >
        <app-icon [name]="item.icon" />
        <span class="label">{{ item.label }}</span>
      </a>
    }
  `,
  styleUrl: './bottom-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', 'aria-label': 'Main' },
})
export class BottomNav {
  protected readonly items = MOBILE_NAV_ITEMS;
}
