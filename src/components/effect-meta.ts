import type { IconName } from '@/components/ui/icon';
import { ICON_BG } from '@/configs/ui';
import type { EffectMode } from '@/types/settings';

/** Icon + màu nền icon + mô tả cho từng hiệu ứng (ô mẫu, list Hiệu ứng ở tab Tạo). */
export const EFFECT_META: Record<EffectMode, { icon: IconName; color: string; description: string }> = {
  solid: { icon: 'remove', color: ICON_BG.gray, description: 'Một màu, không nhấp nháy' },
  blink: { icon: 'pulse', color: ICON_BG.blue, description: 'Bật/tắt đều theo nhịp' },
  strobe: { icon: 'flash', color: ICON_BG.red, description: 'Có cảnh báo động kinh' },
  rainbow: { icon: 'sparkles', color: ICON_BG.purple, description: 'Chuyển dần qua các màu' },
};
