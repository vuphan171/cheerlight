import { RADII, TYPE, UI } from '@/configs/ui';

type ScaleStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const SCALING = 1;

const SPACE_SCALE: Record<ScaleStep, number> = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 40,
  8: 48,
  9: 64,
};

const FONT_SIZE_SCALE: Record<ScaleStep, number> = {
  1: 12,
  2: 14,
  3: 16,
  4: 18,
  5: 20,
  6: 24,
  7: 28,
  8: 35,
  9: 60,
};

const LINE_HEIGHT_SCALE: Record<ScaleStep, number> = {
  1: 16,
  2: 20,
  3: 24,
  4: 26,
  5: 28,
  6: 30,
  7: 36,
  8: 40,
  9: 60,
};

const space = (step: ScaleStep) => SPACE_SCALE[step] * SCALING;
const fontSize = (step: ScaleStep) => FONT_SIZE_SCALE[step] * SCALING;
const lineHeight = (step: ScaleStep) => LINE_HEIGHT_SCALE[step] * SCALING;

export const lightTheme = {
  colors: UI,
  type: TYPE,
  radii: { ...RADII, full: 9999 },
  space,
  fontSize,
  lineHeight,
  shadows: {
    sm: '0 2px 6px rgba(0,0,0,0.18)',
  },
  opacity: {
    disabled: 0.4,
  },
} as const;

export const appThemes = {
  light: lightTheme,
} as const;

export type { ScaleStep };
