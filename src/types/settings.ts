export type EffectMode = 'solid' | 'blink' | 'strobe' | 'rainbow';

export type ScrollDirection = 'left' | 'right';

export type TextFont = 'led' | 'system';

export type TorchMode = 'steady' | 'blink';

export interface LightSettings {
  backgroundColor: string; // hex
  effect: EffectMode;
  speed: number; // 1–10, quy đổi ra ms trong configs/effects.ts
  text: string; // rỗng = không hiện marquee
  textColor: string;
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
