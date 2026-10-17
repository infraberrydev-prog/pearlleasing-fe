import { IconName } from '../shared/ui';

export interface NavItem {
  label: string;
  /** Shown in the collapsed rail while the icon SVG hasn't been exported. */
  short: string;
  path: string;
  icon: IconName;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Leasing Reports', short: 'LR', path: '/leasing', icon: 'nav-leasing-reports' },
  { label: 'Expenses Reports', short: 'ER', path: '/expenses', icon: 'nav-expenses-reports' },
];

/** Mobile bottom navigation adds "More", which holds Log out (Figma 385:23942). */
export const MOBILE_NAV_ITEMS: readonly NavItem[] = [
  ...NAV_ITEMS,
  { label: 'More', short: '•••', path: '/more', icon: 'nav-more' },
];
