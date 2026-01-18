export type IconName = 'delete' | 'edit' | 'create';

export const ICON_PATHS: Record<IconName, string[]> = {
  delete: [
    'M7 3h10',
    'M8 3h8l1.5 2H6.5L8 3Z',
    'M4 7h16',
    'M6 7l1.2 14h9.6L18 7',
    'M9.5 11v6',
    'M14.5 11v6',
  ],

  edit: [
    'M3 21h4.5l13-13a2 2 0 0 0 0-3l-1.5-1.5a2 2 0 0 0-3 0L3 16.5V21Z',
    'M14 5l6 6',
    'M3 16.5h6',
  ],

  create: ['M12 5v14', 'M5 12h14'],
};
