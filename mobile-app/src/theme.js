/**
 * Design tokens — colour palette, typography, spacing, and status mappings.
 * Rich, dark-accented modern aesthetic for mobile app.
 */

export const Colors = {
  ink: '#141D28',
  inkSoft: '#2A3848',
  paper: '#EFECE6',
  card: '#FFFFFF',
  border: '#D5D2C7',
  muted: '#5A6578',

  // Accent — amber
  amber: '#C47B1E',
  amberDeep: '#6F450B',
  amberBg: '#F7E5C8',

  // Primary — teal
  teal: '#235751',
  tealDeep: '#123330',
  tealBg: '#D4E7E3',

  // Semantic
  success: '#2E6B47',
  successBg: '#D7ECE0',
  danger: '#A33B2E',
  dangerBg: '#F5D8D4',

  // Misc
  white: '#FFFFFF',
  overlay: 'rgba(20,29,40,0.55)',
};

export const Fonts = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  semibold: { fontFamily: 'System', fontWeight: '600' },
  bold: { fontFamily: 'System', fontWeight: '700' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

/** Maps a service-request status string to { bg, fg, label } */
export const StatusStyle = {
  submitted: { bg: Colors.amberBg, fg: Colors.amberDeep, label: 'Submitted' },
  matched: { bg: Colors.tealBg, fg: Colors.tealDeep, label: 'Matched' },
  quoted: { bg: '#EDE9FE', fg: '#5B21B6', label: 'Quoted' },
  accepted: { bg: Colors.tealBg, fg: Colors.teal, label: 'Accepted' },
  in_progress: { bg: '#DBEAFE', fg: '#1E40AF', label: 'In Progress' },
  completed: { bg: Colors.successBg, fg: Colors.success, label: 'Completed' },
  cancelled: { bg: Colors.dangerBg, fg: Colors.danger, label: 'Cancelled' },
};

export const STATUS_FLOW = [
  'submitted',
  'matched',
  'quoted',
  'accepted',
  'in_progress',
  'completed',
];
