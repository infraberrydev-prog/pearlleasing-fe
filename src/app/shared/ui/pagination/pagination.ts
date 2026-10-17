import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Button } from '../button/button';

export type PageItem = number | 'gap';

/**
 * Page numbers to show: always the first and last three around the edges, the
 * neighbours of the current page, and "…" for the rest (Figma: 1 2 3 … 8 9 10).
 */
export function pageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const keep = new Set([1, 2, 3, pageCount - 2, pageCount - 1, pageCount, page - 1, page, page + 1]);
  const pages = [...keep].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const items: PageItem[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push('gap');
    items.push(p);
  });
  return items;
}

/** Figma "Pagination" (93:3392, "Page minimal center aligned"). */
@Component({
  selector: 'app-pagination',
  imports: [Button],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', 'aria-label': 'Pagination' },
})
export class Pagination {
  /** 1-based current page. */
  readonly page = model(1);
  readonly pageCount = input.required<number>();

  protected readonly items = computed(() => pageItems(this.page(), this.pageCount()));

  protected go(page: number): void {
    if (page >= 1 && page <= this.pageCount() && page !== this.page()) this.page.set(page);
  }
}
