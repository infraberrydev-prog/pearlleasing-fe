import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
  | 'lock-02'
  | 'shield-check'
  | 'x-03';

@Component({
  selector: 'app-icon',
  template: `<img [src]="src()" [alt]="label() ?? ''" [width]="size()" [height]="size()" />`,
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
}
