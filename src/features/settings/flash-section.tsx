import { TORCH_MAX_FLASHES_PER_SECOND } from '@/configs/effects';
import { MenuGroup } from '@/components/ui/menu-group';
import { MenuItem } from '@/components/ui/menu-item';
import { ICON_BG } from '@/configs/ui';
import { useTorchPermission } from '@/hooks/use-torch-permission';
import { useStrings } from '@/i18n';

/** Nhóm "Đèn flash": trạng thái quyền Camera, chạm để xin quyền hoặc mở Cài đặt hệ thống. */
const FlashSection = () => {
  const t = useStrings();
  const torch = useTorchPermission();

  const onCameraRow = () => {
    if (torch.status === 'undetermined') void torch.ensure();
    else if (torch.status === 'blocked' || torch.status === 'granted') torch.openSettings();
  };

  return (
    <MenuGroup
      label={t.settings.flash}
      footer={t.settings.flashFooter(t.flash.note(TORCH_MAX_FLASHES_PER_SECOND))}>
      <MenuItem
        title={t.flashTab.cameraPermission}
        icon={{ name: 'camera', color: ICON_BG.orange }}
        value={t.torchStatus[torch.status]}
        chevron={torch.status !== 'unavailable'}
        onPress={torch.status === 'unavailable' ? undefined : onCameraRow}
        last
      />
    </MenuGroup>
  );
};

export { FlashSection };
