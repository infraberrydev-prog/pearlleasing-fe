import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type ButtonVariant =
  | 'primary' // brand fill — "Log in", "Stay on page"
  | 'secondary' // white with border — "Cancel"
  | 'tertiary' // transparent — "Back to log in"
  | 'danger' // red fill — "Delete"
  | 'danger-subtle'; // pink fill — "Leave & Discard"

export type ButtonSize = 'md' | 'sm';

/**
 * Figma "Button". Applied as an attribute so native button/link semantics are kept:
 * `<button app-button variant="secondary">Cancel</button>`.
 * Project an `<app-icon>` before or after the label for icon buttons.
 */
@Component({
  selector: 'button[app-button], a[app-button]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-button',
    '[class]': '"app-button--" + variant() + " app-button--" + size()',
    '[class.app-button--block]': 'block()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  /** Stretch to the container width (auth forms, dialog button groups). */
  readonly block = input(false, { transform: booleanAttribute });
}
