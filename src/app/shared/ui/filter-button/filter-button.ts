import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

/**
 * Figma "Filter Button" (toolbar Sort / Filter): white, input border, icon + Text md/Semibold.
 * `<button app-filter-button><app-icon name="filter" />Filter</button>`
 */
@Component({
  selector: 'button[app-filter-button]',
  template: '<ng-content />',
  styleUrl: './filter-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { type: 'button' },
})
export class FilterButton {
  /** Lets a dropdown panel anchor to this button via a template reference. */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}

/** Joins adjacent filter buttons into one bordered group (Figma 1087:22213 "Actions"). */
@Component({
  selector: 'app-filter-button-group',
  template: '<ng-content />',
  styleUrl: './filter-button-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group' },
})
export class FilterButtonGroup {}
