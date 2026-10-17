import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Figma "Empty states" (284:11137): 200px illustration, Text lg/Semibold title,
 * optional supporting text, and projected actions (e.g. "Create Report").
 */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="content">
      @if (illustration(); as src) {
        <img class="illustration" [src]="src" alt="" width="200" height="180" />
      }
      <div class="text">
        <h2 class="title">{{ title() }}</h2>
        @if (description()) {
          <p class="description">{{ description() }}</p>
        }
      </div>
    </div>
    <ng-content />
  `,
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status' },
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** Illustration path; defaults to the "No available reports" art from Figma. */
  readonly illustration = input<string | null>('images/empty-reports.svg');
}
