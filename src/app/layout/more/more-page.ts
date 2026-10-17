import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Icon } from '../../shared/ui';
import { LogoutService } from '../logout.service';
import { PageHeader } from '../page-header/page-header';

/** Mobile "More" tab (Figma 385:23942): a card with Log out. */
@Component({
  selector: 'app-more-page',
  imports: [PageHeader, Icon],
  template: `
    <app-page-header title="More" />
    <button type="button" class="row" (click)="logout.confirmLogout()">
      <app-icon name="logout-02" />
      <span>Log out</span>
    </button>
  `,
  styleUrl: './more-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-page' },
})
export class MorePage {
  protected readonly logout = inject(LogoutService);
}
