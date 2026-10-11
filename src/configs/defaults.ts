import type { AppPrefs, LightSettings } from '@/types/settings';

export const DEFAULT_SETTINGS: LightSettings = {
  backgroundColor: '#FF2FD6',
  effect: 'solid',
  speed: 5,
  text: '',
  textColorMode: 'auto',
  textColor: '#FFFFFF',
  fontSize: 120,
  scrollSpeed: 5,
  scrollDirection: 'left',
  torchEnabled: false,
  torchSyncWithEffect: false,
  textFont: 'led',
  torchMode: 'steady',
  torchRate: 5,
};

export const AUTO_HIDE_OPTIONS = [2000, 3000, 5000] as const;

export const DEFAULT_PREFS: AppPrefs = {
  showTapHint: true,
  maxBrightness: true,
  autoHideMs: 3000,
};
