import { TORCH_MAX_FLASHES_PER_SECOND } from '@/configs/effects';
import { MenuGroup } from '@/components/ui/menu/menu-group';
import { MenuInfo } from '@/components/ui/menu/menu-info';
import { MenuLink } from '@/components/ui/menu/menu-link';
import { ICON_BG } from '@/configs/ui';
import { useTorchPermission } from '@/hooks/use-torch-permission';
import { useStrings } from '@/i18n';

/** Nhóm "Đèn flash": trạng thái quyền Camera, chạm để xin quyền hoặc mở Cài đặt hệ thống. */
const FlashSection = () => {
  const t = useStrings();
  const torch = useTorchPermission();

  const cameraIcon = { name: 'camera', color: ICON_BG.orange } as const;

  const onCameraRow = () => {
    if (torch.status === 'undetermined') void torch.ensure();
    else if (torch.status === 'blocked' || torch.status === 'granted') torch.openSettings();
  };

  return (
    <MenuGroup
      label={t.settings.flash}
      footer={t.settings.flashFooter(t.flash.note(TORCH_MAX_FLASHES_PER_SECOND))}>
      {torch.status === 'unavailable' ? (
        <MenuInfo title={t.flashTab.cameraPermission} icon={cameraIcon} value={t.torchStatus.unavailable} />
      ) : (
        <MenuLink
          title={t.flashTab.cameraPermission}
          icon={cameraIcon}
          value={t.torchStatus[torch.status]}
          onPress={onCameraRow}
        />
      )}
    </MenuGroup>
  );
};

export { FlashSection };
