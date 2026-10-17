import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Figma "Divider" (type Line): 16px tall, 1px line centred. Uses the exported line SVG. */
@Component({
  selector: 'app-divider',
  template: '<img src="icons/divider-line.svg" alt="" width="358" height="16" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator', style: 'display: block; width: 100%; height: 16px;' },
  styles: 'img { width: 100%; height: 16px; }',
})
export class Divider {}
