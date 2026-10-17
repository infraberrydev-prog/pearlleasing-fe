import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Temporary content box for pages that aren't built yet. */
@Component({
  selector: 'app-page-placeholder',
  template: '<p><ng-content /></p>',
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 320px;
      padding: var(--spacing-3xl);
      border: 1px dashed var(--color-border-default);
      border-radius: var(--radius-md);
      color: var(--color-text-subtler);
      text-align: center;
    }
    p {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePlaceholder {}
