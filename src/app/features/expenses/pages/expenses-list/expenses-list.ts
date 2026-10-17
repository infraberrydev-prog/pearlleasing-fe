import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../../../layout/page-header/page-header';
import { PagePlaceholder } from '../../../../layout/page-placeholder/page-placeholder';

/** Placeholder until step 9 (Expenses) in docs/figma-plan.md. */
@Component({
  selector: 'app-expenses-list',
  imports: [PageHeader, PagePlaceholder],
  template: `
    <app-page-header title="Expenses Reports" />
    <app-page-placeholder>The expenses report list arrives in step 9.</app-page-placeholder>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-page' },
})
export class ExpensesList {}
