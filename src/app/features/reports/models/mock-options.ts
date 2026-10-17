/**
 * Dev-only switch for the mock APIs: open a list with `?empty` (e.g. `/leasing?empty`) to start
 * with no reports and see the empty state. It lasts until the page is reloaded without it.
 * Real APIs ignore this.
 */
export function mockStartsEmpty(): boolean {
  return typeof location !== 'undefined' && new URLSearchParams(location.search).has('empty');
}
