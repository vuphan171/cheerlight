import { Switch } from 'react-native';

import { UI } from '@/configs/ui';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, accessibilityLabel, disabled }: ToggleProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ true: UI.accent, false: UI.fill }}
      ios_backgroundColor={UI.fill}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
