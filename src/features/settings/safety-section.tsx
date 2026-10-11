import { Alert } from "react-native";

import { MenuGroup } from "@/components/ui/menu/menu-group";
import { MenuAction } from "@/components/ui/menu/menu-action";
import { useSettings } from "@/hooks/use-settings";
import { useStrings } from "@/i18n";

const SafetySection = () => {
  const t = useStrings();
  const { strobeAccepted, resetStrobeWarning } = useSettings();

  return (
    <MenuGroup label={t.settings.safety}>
      <MenuAction
        title={t.settings.showStrobeWarning}
        disabled={!strobeAccepted}
        onPress={() => {
          resetStrobeWarning();
          Alert.alert(t.settings.strobeResetTitle, t.settings.strobeResetBody);
        }}
      />
    </MenuGroup>
  );
};

export { SafetySection };
