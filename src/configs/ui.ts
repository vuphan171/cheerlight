import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Màu giao diện (tông sáng kiểu iOS). Màn Phát không dùng các màu này. */
export const UI = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  surfacePressed: '#E9E9EE',
  fill: 'rgba(118,118,128,0.12)',
  separator: 'rgba(60,60,67,0.29)',
  label: '#1C1C1E',
  secondary: '#6C6C70',
  chevron: '#C4C4C7',
  accent: '#2C73D2',
  accentPressed: '#235EAD',
  danger: '#D70015',
  overlay: 'rgba(0,0,0,0.2)',
  onAccent: '#FFFFFF',
} as const;

/** Màu màn Phát: luôn nền đen, không theo tông sáng của `UI`. */
export const PLAY_UI = {
  bg: '#000000',
  chip: 'rgba(0,0,0,0.6)',
  label: '#FFFFFF',
} as const;

export const ICON_BG = {
  blue: '#0A84FF',
  orange: '#FF9F0A',
  red: '#FF3B30',
  yellow: '#FFCC00',
  gray: '#8E8E93',
  purple: '#AF52DE',
} as const;

export const TYPE = {
  largeTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.4, color: UI.label },
  navTitle: { fontSize: 17, fontWeight: '600', color: UI.label },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: UI.label },
  body: { fontSize: 17, color: UI.label },
  groupLabel: { fontSize: 13, color: UI.secondary, textTransform: 'uppercase' },
  segmented: { fontSize: 13, fontWeight: '500', color: UI.label },
  tabLabel: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, color: UI.secondary },
} as const satisfies Record<string, TextStyle>;

export const RADII = {
  group: 18,
  tile: 22,
  recentCard: 26,
  preview: 20,
  segmented: 9,
  segmentedThumb: 7,
  tabBar: 30,
  tabPill: 24,
  dialog: 18,
} as const;

export const SPACING = 16;
export const GROUP_GAP = 24;
export const ROW_MIN_HEIGHT = 52;

/** Chừa chỗ dưới cùng nội dung cuộn để thanh tab nổi không che. */
export const TAB_BAR_CLEARANCE = 116;

export const SHADOW = {
  floating: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1C1C1E',
      shadowOpacity: 0.16,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 10 },
    },
    default: { elevation: 8 },
  }),
  small: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    default: { elevation: 3 },
  }),
} as const;
