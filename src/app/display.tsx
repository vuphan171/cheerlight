import { useCameraPermissions } from 'expo-camera';
import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { router, useIsFocused, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet } from 'react-native';

import { LightCanvas, useEffectClock } from '@/components/light-canvas';
import { Marquee } from '@/components/marquee';
import { resolveTextColor } from '@/configs/colors';
import { scrollPixelsPerSecond, torchPlan } from '@/configs/effects';
import { fontFamilyFor } from '@/configs/fonts';
import { DisplayOverlay } from '@/features/display/display-overlay';
import { TorchController } from '@/features/display/torch-controller';
import { useMaxBrightness } from '@/features/display/use-max-brightness';
import { useLandscape } from '@/hooks/use-landscape';
import { useSettings } from '@/hooks/use-settings';

const HINT_MS = 2000;

/** Bật `true` rồi tự về `false` sau `ms` kể từ lần `show()` gần nhất. */
function useTransient(ms: number, initial = false) {
  const [state, setState] = useState({ visible: initial, key: 0 });
  useEffect(() => {
    if (!state.visible) return;
    const timer = setTimeout(() => setState((s) => ({ ...s, visible: false })), ms);
    return () => clearTimeout(timer);
  }, [state, ms]);
  return {
    visible: state.visible,
    show: () => setState((s) => ({ visible: true, key: s.key + 1 })),
    hide: () => setState((s) => ({ ...s, visible: false })),
  };
}

export default function DisplayScreen() {
  useKeepAwake();
  useLandscape();
  const {
    nowPlaying,
    presets,
    lastUsedPresetId,
    draft,
    prefs,
    torchAvailable,
    markTorchUnavailable,
  } = useSettings();
  useMaxBrightness(prefs.maxBrightness);
  const navigation = useNavigation();
  const [permission] = useCameraPermissions();
  // Chỉ ẩn thanh hệ thống khi màn hình đang focus.
  const focused = useIsFocused();

  // Mở thẳng qua deep link (chưa có nowPlaying) → mẫu dùng gần nhất, không có thì bản nháp.
  const settings = nowPlaying ?? presets.find((p) => p.id === lastUsedPresetId)?.settings ?? draft;
  const progress = useEffectClock(settings.effect, settings.speed);

  const controls = useTransient(prefs.autoHideMs);
  const lockHint = useTransient(HINT_MS);
  const tapHint = useTransient(HINT_MS, prefs.showTapHint);
  const [locked, setLocked] = useState(false);

  // Đã khoá: tắt vuốt quay lại (iOS) và chặn nút Back (Android).
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !locked });
  }, [navigation, locked]);

  useEffect(() => {
    if (!locked) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      lockHint.show();
      return true;
    });
    return () => sub.remove();
  }, [locked, lockHint]);

  const onTap = () => {
    tapHint.hide();
    if (locked) {
      if (lockHint.visible) lockHint.hide();
      else lockHint.show();
    } else if (controls.visible) {
      controls.hide();
    } else {
      controls.show();
    }
  };

  const lock = () => {
    controls.hide();
    setLocked(true);
    lockHint.show();
  };

  const unlock = () => {
    setLocked(false);
    lockHint.hide();
    controls.show();
  };

  const exit = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const flashOn =
    torchAvailable && permission?.granted === true && torchPlan(settings).kind !== 'off';

  return (
    <Pressable style={styles.container} onPress={onTap}>
      <StatusBar hidden={focused} style="light" />
      <NavigationBar hidden={focused} />
      <LightCanvas color={settings.backgroundColor} effect={settings.effect} progress={progress} />
      <Marquee
        text={settings.text}
        color={resolveTextColor(settings)}
        fontSize={settings.fontSize}
        fontFamily={fontFamilyFor(settings.textFont)}
        pixelsPerSecond={scrollPixelsPerSecond(settings.scrollSpeed)}
        direction={settings.scrollDirection}
      />
      <TorchController
        settings={settings}
        progress={progress}
        // Máy đã báo không dùng được camera → không mount CameraView nữa.
        active={focused && torchAvailable}
        onUnavailable={markTorchUnavailable}
      />
      <DisplayOverlay
        controlsVisible={controls.visible}
        locked={locked}
        lockHintVisible={lockHint.visible}
        tapHintVisible={tapHint.visible}
        flashOn={flashOn}
        onExit={exit}
        onLock={lock}
        onUnlock={unlock}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
