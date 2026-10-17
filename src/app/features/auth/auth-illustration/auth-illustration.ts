import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ILLUSTRATION_BASE, ILLUSTRATION_LAYERS } from './illustration-layers';

/** Login illustration (Figma 353:8605), rebuilt from its exported vector layers. */
@Component({
  selector: 'app-auth-illustration',
  template: `
    <img class="layer base" [src]="dir + base + '.svg'" alt="" />
    @for (layer of layers; track $index) {
      <img
        class="layer"
        [src]="dir + layer[0] + '.svg'"
        alt=""
        [style.left.%]="layer[1]"
        [style.top.%]="layer[2]"
        [style.width.%]="layer[3]"
        [style.height.%]="layer[4]"
      />
    }
  `,
  styleUrl: './auth-illustration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', 'aria-label': 'People reviewing report charts on a large monitor' },
})
export class AuthIllustration {
  protected readonly dir = 'images/auth-illustration/';
  protected readonly base = ILLUSTRATION_BASE;
  protected readonly layers = ILLUSTRATION_LAYERS;
}
