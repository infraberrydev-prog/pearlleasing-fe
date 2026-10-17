import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PageHeader } from '../../../layout/page-header/page-header';
import { PagePlaceholder } from '../../../layout/page-placeholder/page-placeholder';

/** Stand-in for View (step 8) so the list's links lead somewhere. */
@Component({
  selector: 'app-leasing-placeholder',
  imports: [PageHeader, PagePlaceholder, RouterLink],
  template: `
    <app-page-header [title]="'Report ' + id()" />
    <app-page-placeholder>
      Viewing a report arrives in step 8.
      <a [routerLink]="['/leasing', id(), 'edit']">Edit this report</a> ·
      <a routerLink="/leasing">Back to Leasing Reports</a>
    </app-page-placeholder>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-page' },
})
export class LeasingPlaceholder {
  protected readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))));
}
