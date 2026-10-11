import type { LightSettings } from '@/types/settings';

/** Props chung cho các tab con của tab Tạo: bộ cài đặt đang chỉnh + hàm cập nhật. */
export interface EditorTabProps {
  settings: LightSettings;
  update: (patch: Partial<LightSettings>) => void;
}
