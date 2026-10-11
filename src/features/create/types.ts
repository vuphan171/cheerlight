import type { LightSettings } from '@/types/settings';

export interface EditorTabProps {
  settings: LightSettings;
  update: (patch: Partial<LightSettings>) => void;
}
