export type EffectMode = 'solid' | 'blink' | 'strobe' | 'rainbow';

export type ScrollDirection = 'left' | 'right';

export type TextFont = 'led' | 'system';

export type TorchMode = 'steady' | 'blink';

/** 'auto': chữ đen/trắng theo độ chói nền; 'fixed': dùng `textColor`. */
export type TextColorMode = 'auto' | 'fixed';

export interface LightSettings {
  backgroundColor: string; // hex
  effect: EffectMode;
  speed: number; // 1–10, quy đổi ra ms trong configs/effects.ts
  text: string; // rỗng = không hiện marquee
  textColorMode: TextColorMode;
  textColor: string; // chỉ dùng khi textColorMode = 'fixed'
  fontSize: number;
  scrollSpeed: number; // 1–10
  scrollDirection: ScrollDirection;
  torchEnabled: boolean;
  torchSyncWithEffect: boolean;
  // Mở rộng so với PLAN mục 5 (xem NOTES.md):
  textFont: TextFont; // 'system' khi font LED thiếu glyph (tiếng Việt có dấu, emoji)
  torchMode: TorchMode; // khi torchSyncWithEffect = false
  torchRate: number; // 1–10, nhịp nháy riêng của flash
}

/** Một bộ cài đặt người dùng đặt tên và lưu lại để phát nhanh. */
export interface Preset {
  id: string;
  name: string;
  settings: LightSettings;
  updatedAt: number; // ms
}

export type AutoHideMs = 2000 | 3000 | 5000;

/** Tuỳ chọn chung của app (tab Cài đặt). */
export interface AppPrefs {
  showTapHint: boolean;
  maxBrightness: boolean;
  autoHideMs: AutoHideMs;
}
