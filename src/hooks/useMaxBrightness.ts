import * as Brightness from 'expo-brightness';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState, Platform } from 'react-native';

/**
 * Đặt độ sáng màn hình của app về tối đa khi màn hình đang focus, khôi phục khi rời đi.
 *
 * - Android: chỉ đổi brightness của window (activity) hiện tại, không cần quyền WRITE_SETTINGS.
 *   Khôi phục bằng `restoreSystemBrightnessAsync` để window quay về dùng brightness hệ thống.
 * - iOS: `setBrightnessAsync` đổi độ sáng màn hình và giữ nguyên cả khi app vào background,
 *   nên phải khôi phục giá trị cũ khi app rời foreground và đặt lại tối đa khi quay về.
 */
export function useMaxBrightness(): void {
  useFocusEffect(
    useCallback(() => {
      let saved: number | null = null;
      let boosted = false;
      let disposed = false;

      const boost = async () => {
        try {
          if (!(await Brightness.isAvailableAsync())) return;
          const current = await Brightness.getBrightnessAsync();
          if (disposed) return;
          saved = current;
          await Brightness.setBrightnessAsync(1);
          boosted = true;
        } catch (e) {
          console.warn('[useMaxBrightness] boost failed', e);
        }
      };

      const restore = async () => {
        if (!boosted) return;
        boosted = false;
        try {
          if (Platform.OS === 'android') {
            await Brightness.restoreSystemBrightnessAsync();
          } else if (saved !== null) {
            await Brightness.setBrightnessAsync(saved);
          }
        } catch (e) {
          console.warn('[useMaxBrightness] restore failed', e);
        }
      };

      void boost();

      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          if (!boosted) void boost();
        } else if (Platform.OS === 'ios') {
          void restore();
        }
      });

      return () => {
        disposed = true;
        sub.remove();
        void restore();
      };
    }, []),
  );
}
