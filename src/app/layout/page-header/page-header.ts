import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Page title row at the top of the content ("Leasing Reports", 20/28 semibold).
 * Project actions (e.g. the hidden-in-Figma "Button Group") to the right.
 */
@Component({
  selector: 'app-page-header',
  template: `
    <h1 class="title">{{ title() }}</h1>
    <ng-content />
  `,
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
}
