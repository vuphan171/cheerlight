import { Alert } from "react-native";

import { MenuGroup } from "@/components/ui/menu-group";
import { MenuItem } from "@/components/ui/menu-item";
import { UI } from "@/configs/ui";
import { useSettings } from "@/hooks/use-settings";
import { useStrings } from "@/i18n";

const SafetySection = () => {
  const t = useStrings();
  const { strobeAccepted, resetStrobeWarning } = useSettings();

  return (
    <MenuGroup label={t.settings.safety}>
      <MenuItem
        title={t.settings.showStrobeWarning}
        titleColor={UI.accent}
        disabled={!strobeAccepted}
        onPress={() => {
          resetStrobeWarning();
          Alert.alert(t.settings.strobeResetTitle, t.settings.strobeResetBody);
        }}
        last
      />
    </MenuGroup>
  );
};

export { SafetySection };
