import { Segmented } from '@/components/segmented';
import { EFFECTS } from '@/configs/effects';
import type { EffectMode } from '@/types/settings';

const OPTIONS = EFFECTS.map(({ mode, label }) => ({ value: mode, label }));

interface EffectSelectorProps {
  value: EffectMode;
  onChange: (mode: EffectMode) => void;
  compact?: boolean;
}

export function EffectSelector({ value, onChange, compact }: EffectSelectorProps) {
  return <Segmented options={OPTIONS} value={value} onChange={onChange} compact={compact} />;
}
