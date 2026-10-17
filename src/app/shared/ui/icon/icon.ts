import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';

/**
 * Icons are the SVGs exported from Figma into `public/icons`. Colors are baked
 * into each file, so a color variant is a separate name (e.g. `-danger`).
 */
export type IconName =
  | 'arrow-left-sm'
  | 'close-inverse'
  | 'email'
  | 'eye-closed'
  | 'eye-open'
  | 'information-circle-contained-danger'
  | 'information-circle-contained-warning'
  | 'layout-left'
  | 'lock-02'
  | 'logout-02'
  | 'nav-expenses-reports'
  | 'nav-leasing-reports'
  | 'nav-more'
  | 'shield-check'
  | 'x-03';

/**
 * Icons not exported from Figma yet: the image is hidden and any projected
 * fallback content (e.g. an abbreviation) is shown instead of a broken image.
 */
@Component({
  selector: 'app-icon',
  template: `
    @if (failed()) {
      <ng-content />
    } @else {
      <img
        [src]="src()"
        [alt]="label() ?? ''"
        [width]="size()"
        [height]="size()"
        (error)="failed.set(true)"
      />
    }
  `,
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[style.--icon-size.px]': 'size()',
  },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
  /** Accessible name. Leave empty for decorative icons. */
  readonly label = input<string>();

  protected readonly src = computed(() => `icons/${this.name()}.svg`);
  protected readonly failed = signal(false);

  constructor() {
    // A new name gets a fresh load attempt.
    effect(() => {
      this.name();
      this.failed.set(false);
    });
  }
}
