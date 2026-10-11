import type { IconName } from '@/components/ui/icon';
import { ICON_BG } from '@/configs/ui';
import type { EffectMode } from '@/types/settings';

export const EFFECT_META: Record<EffectMode, { icon: IconName; color: string }> = {
  solid: { icon: 'remove', color: ICON_BG.gray },
  blink: { icon: 'pulse', color: ICON_BG.blue },
  strobe: { icon: 'flash', color: ICON_BG.red },
  rainbow: { icon: 'sparkles', color: ICON_BG.purple },
};
