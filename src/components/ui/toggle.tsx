import type React from "react";
import { Switch, SwitchProps } from "react-native";

import { UI } from "@/configs/ui";

interface Props extends SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

export const Toggle: React.FC<Props> = ({ value, onValueChange, ...props }) => {
  return (
    <Switch
      trackColor={{ true: UI.accent, false: UI.fill }}
      ios_backgroundColor={UI.fill}
      value={value}
      onValueChange={onValueChange}
      {...props}
    />
  );
};
