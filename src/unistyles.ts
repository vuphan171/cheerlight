import { StyleSheet } from 'react-native-unistyles';

import { appThemes } from '@/configs/theme';

type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: { initialTheme: 'light' },
});
