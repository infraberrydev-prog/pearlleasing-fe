import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { PesoPipe, ReportDatePipe } from '../../../shared/pipes/format.pipes';
import { Checkbox, Icon, Menu, MenuItem } from '../../../shared/ui';
import { ReportSummary } from '../models/report';

/**
 * Report card for tablet (Figma 927:40111: eye + trash icons, dates side by side)
 * and mobile (920:14089: ⋮ menu, dates stacked).
 */
@Component({
  selector: 'app-report-card',
  imports: [CdkMenuTrigger, PesoPipe, ReportDatePipe, Checkbox, Icon, Menu, MenuItem],
  templateUrl: './report-card.html',
  styleUrl: './report-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-compact]': 'compact()', '[class.is-selected]': 'selected()' },
})
export class ReportCard {
  readonly report = input.required<ReportSummary>();
  readonly amountLabel = input.required<string>();
  /** Mobile layout: actions in a menu, dates stacked. */
  readonly compact = input(false);
  readonly selected = model(false);
  readonly viewed = output<void>();
  readonly deleted = output<void>();
}
