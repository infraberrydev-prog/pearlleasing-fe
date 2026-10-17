import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';

/**
 * Figma "Action" menu (641:37260): white, border/subtle, 12px radius, shadow/lg.
 * Keyboard and focus handling come from CDK Menu. Open it with `[cdkMenuTriggerFor]`:
 *
 *   <button [cdkMenuTriggerFor]="actions">…</button>
 *   <ng-template #actions>
 *     <app-menu>
 *       <button app-menu-item (triggered)="view()"><app-icon name="eye-open" />View</button>
 *     </app-menu>
 *   </ng-template>
 */
@Component({
  selector: 'app-menu',
  template: '<ng-content />',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkMenu],
})
export class Menu {}

/** Figma "_Action menu item": 24px icon, 16px gap, Text md/Regular. */
@Component({
  selector: 'button[app-menu-item]',
  template: '<ng-content />',
  styleUrl: './menu-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: CdkMenuItem, outputs: ['cdkMenuItemTriggered: triggered'] }],
  host: { type: 'button' },
})
export class MenuItem {}
