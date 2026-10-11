import { useCameraPermissions } from 'expo-camera';
import { useEffect } from 'react';
import { AppState, Keyboard, Linking, Platform } from 'react-native';

import { useSettings } from '@/hooks/use-settings';

export type TorchPermissionStatus = 'granted' | 'undetermined' | 'blocked' | 'unavailable';

export function useTorchPermission() {
  const { torchAvailable } = useSettings();
  const [permission, requestPermission, getPermission] = useCameraPermissions();

  // Người dùng có thể vừa cấp quyền trong Cài đặt rồi quay lại app.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  const granted = permission?.granted === true;
  let status: TorchPermissionStatus;
  if (Platform.OS === 'web' || !torchAvailable) status = 'unavailable';
  else if (granted) status = 'granted';
  else if (permission !== null && !permission.canAskAgain) status = 'blocked';
  else status = 'undetermined';

  /** Xin quyền nếu chưa có. Trả về `true` khi đã có quyền. */
  const ensure = async (): Promise<boolean> => {
    if (granted) return true;
    if (status !== 'undetermined') return false;
    // Bỏ focus ô nhập chữ, nếu không Android sẽ bật lại bàn phím sau khi đóng hộp thoại quyền.
    Keyboard.dismiss();
    const result = await requestPermission();
    return result.granted;
  };

  const openSettings = () => void Linking.openSettings();

  return { status, granted, ensure, openSettings };
}
