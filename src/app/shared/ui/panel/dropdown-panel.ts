import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
];

/** A DOM element, or a component that exposes its host (`Button`, `FilterButton`). */
export type PanelOrigin = HTMLElement | { elementRef: ElementRef<HTMLElement> };

/**
 * Panel anchored under a trigger (desktop sort / filter, Figma 566:27059 / 568:10951):
 * white, border/subtle, 12px radius, shadow/lg, 390px wide. Closes on outside click or Escape.
 *
 *   <button #sortBtn app-filter-button (click)="sortOpen.set(true)">Sort</button>
 *   <app-dropdown-panel [origin]="sortBtn" [(open)]="sortOpen">…</app-dropdown-panel>
 */
@Component({
  selector: 'app-dropdown-panel',
  imports: [CdkConnectedOverlay, CdkTrapFocus],
  template: `
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="originElement()"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="open.set(false)"
      (detach)="open.set(false)"
      (overlayKeydown)="onKeydown($event)"
    >
      <div
        class="app-panel"
        role="dialog"
        [attr.aria-label]="ariaLabel() ?? null"
        [style.width.px]="width()"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The panel renders in an overlay; the host itself must not take up layout space.
  styles: ':host { display: contents; }',
})
export class DropdownPanel {
  readonly origin = input.required<PanelOrigin>();
  protected readonly originElement = computed(() => {
    const origin = this.origin();
    return origin instanceof HTMLElement ? origin : origin.elementRef.nativeElement;
  });
  readonly open = model(false);
  readonly width = input(390);
  readonly ariaLabel = input<string>();

  protected readonly positions = POSITIONS;

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.open.set(false);
      this.originElement().focus();
    }
  }
}
