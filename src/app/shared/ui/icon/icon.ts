import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';

/**
 * Icons are the SVGs exported from Figma into `public/icons`. Colors are baked
 * into each file, so a color variant is a separate name (e.g. `-danger`).
 */
export type IconName =
  | 'arrow-left-sm'
  | 'calendar-01'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'close-inverse'
  | 'download-01'
  | 'email'
  | 'eye-closed'
  | 'eye-open'
  | 'eye-open-subtle'
  | 'filter'
  | 'information-circle-contained-danger'
  | 'information-circle-contained-warning'
  | 'layout-left'
  | 'lock-02'
  | 'logout-02'
  | 'nav-expenses-reports'
  | 'nav-leasing-reports'
  | 'nav-more'
  | 'plus-02-inverse'
  | 'search-01'
  | 'shield-check'
  | 'sort-updown-arrow'
  | 'trash-03'
  | 'trash-04'
  | 'x-03';

/**
 * Icons not exported from Figma yet: the image is hidden and any projected
 * fallback content (e.g. an abbreviation) is shown instead of a broken image.
 *
 * `tint`: paint the icon's shape in the current text color instead of its baked-in
 * color, for icons whose color follows a state (active/inactive navigation).
 */
@Component({
  selector: 'app-icon',
  template: `
    @if (failed()) {
      <ng-content />
    } @else if (tint()) {
      <span class="tinted" [style.--icon-url]="maskUrl()"></span>
      <img class="probe" [src]="src()" alt="" (error)="failed.set(true)" />
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
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'tint() ? (label() ?? null) : null',
    '[style.--icon-size.px]': 'size()',
  },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
  /** Accessible name. Leave empty for decorative icons. */
  readonly label = input<string>();
  readonly tint = input(false, { transform: booleanAttribute });

  protected readonly src = computed(() => `icons/${this.name()}.svg`);
  protected readonly maskUrl = computed(() => `url("${this.src()}")`);
  protected readonly failed = signal(false);

  constructor() {
    // A new name gets a fresh load attempt.
    effect(() => {
      this.name();
      this.failed.set(false);
    });
  }
}
