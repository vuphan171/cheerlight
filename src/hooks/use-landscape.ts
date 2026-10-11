import { useFocusEffect } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback } from 'react';
import { AppState, Platform } from 'react-native';

const { OrientationLock } = ScreenOrientation;

async function lock(orientation: ScreenOrientation.OrientationLock) {
  if (Platform.OS === 'web') return;
  try {
    await ScreenOrientation.lockAsync(orientation);
  } catch (e) {
    console.warn('[orientation] lock failed', e);
  }
}

/**
 * Khoá hướng màn hình khi màn hình đang focus. Khi app quay lại foreground thì khoá lại,
 * để không bị kẹt ở hướng sai sau khi background.
 */
export function useOrientationLock(orientation: ScreenOrientation.OrientationLock): void {
  useFocusEffect(
    useCallback(() => {
      void lock(orientation);
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') void lock(orientation);
      });
      return () => sub.remove();
    }, [orientation]),
  );
}

export function useLandscape(): void {
  useOrientationLock(OrientationLock.LANDSCAPE);
  useFocusEffect(
    useCallback(
      () => () => {
        void lock(OrientationLock.PORTRAIT_UP);
      },
      [],
    ),
  );
}

export function usePortrait(): void {
  useOrientationLock(OrientationLock.PORTRAIT_UP);
}
