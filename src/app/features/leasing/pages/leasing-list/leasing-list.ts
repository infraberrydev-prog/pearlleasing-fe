import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../../../layout/page-header/page-header';
import { PagePlaceholder } from '../../../../layout/page-placeholder/page-placeholder';

/** Placeholder until step 6 (Leasing list) in docs/figma-plan.md. */
@Component({
  selector: 'app-leasing-list',
  imports: [PageHeader, PagePlaceholder],
  template: `
    <app-page-header title="Leasing Reports" />
    <app-page-placeholder>The leasing report list arrives in step 6.</app-page-placeholder>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-page' },
})
export class LeasingList {}
