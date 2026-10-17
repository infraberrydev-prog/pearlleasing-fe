import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  ConfirmDialogService,
  Divider,
  Icon,
  InputField,
  Radio,
  RadioGroup,
} from '../../shared/ui';
import { ListBlocksDemo } from './list-blocks-demo';

/** Dev-only review page for the shared UI primitives (steps 2 and 5 of docs/figma-plan.md). */
@Component({
  selector: 'app-ui-gallery',
  imports: [
    ReactiveFormsModule,
    Alert,
    Button,
    Checkbox,
    Chip,
    Divider,
    Icon,
    InputField,
    Radio,
    RadioGroup,
    ListBlocksDemo,
  ],
  templateUrl: './ui-gallery.html',
  styleUrl: './ui-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiGallery {
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly username = new FormControl('userpearl02');
  protected readonly password = new FormControl('secret123');
  protected readonly disabledField = new FormControl({ value: 'Read only', disabled: true });
  protected readonly agree = new FormControl(true);
  protected readonly status = new FormControl<'unpaid' | 'paid'>('unpaid');
  protected readonly toastVisible = signal(true);
  protected readonly lastResult = signal<string>('—');

  protected openDiscard(): void {
    this.confirmDialog
      .confirm({
        title: 'Are you sure you want to discard report?',
        message:
          'You have unsaved changes. If you leave now, the report will not be created and all entered information will be lost.',
        tone: 'warning',
        cancelLabel: 'Leave & Discard',
        cancelVariant: 'danger-subtle',
        confirmLabel: 'Stay on page',
      })
      .subscribe((stay) => this.lastResult.set(stay ? 'Stay on page' : 'Leave / dismissed'));
  }

  protected openDelete(): void {
    this.confirmDialog
      .confirm({
        title: 'Are you sure you want to delete report?',
        message:
          'This report and all related transaction details will be removed permanently. This action cannot be undone.',
        tone: 'danger',
        cancelLabel: 'Cancel',
        confirmLabel: 'Delete',
        confirmVariant: 'danger',
      })
      .subscribe((deleted) => this.lastResult.set(deleted ? 'Delete' : 'Cancel / dismissed'));
  }
}
