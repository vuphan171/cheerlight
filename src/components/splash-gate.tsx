import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { useEffect, useState, type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { UI } from '@/configs/ui';
import { useStrings } from '@/i18n';

const ICON_BOX = 128;
const ICON_RADIUS = 30;
// Ô trắng chiếm 480/1024 ảnh splash native, nên ảnh hiển thị 273 thì ô ra đúng 128 như native.
const IMAGE_SIZE = 273;
const TEXT_GAP = 22;
const MIN_VISIBLE_MS = 700;

interface OverlayProps {
  ready: boolean;
  onFinish: () => void;
}

const SplashOverlay: React.FC<OverlayProps> = ({ ready, onFinish }) => {
  const t = useStrings();
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const intro = useSharedValue(0);
  const opacity = useSharedValue(1);
  const leaving = ready && minElapsed;

  useEffect(() => {
    if (!shown) return;
    // Overlay vẽ giống hệt splash native nên ẩn native lúc này không bị chớp.
    SplashScreen.hide();
    intro.set(reduceMotion ? 1 : withDelay(100, withTiming(1, { duration: 250 })));
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [shown, intro, reduceMotion]);

  useEffect(() => {
    if (!leaving) return;
    opacity.set(
      withTiming(0, { duration: reduceMotion ? 100 : 250 }, (finished) => {
        if (finished) scheduleOnRN(onFinish);
      }),
    );
  }, [leaving, opacity, reduceMotion, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  // Ảnh native không có bóng, nên bóng hiện dần cùng chữ để lúc chuyển sang overlay không nhảy hình.
  const introStyle = useAnimatedStyle(() => ({ opacity: intro.get() }));

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      pointerEvents={leaving ? 'none' : 'auto'}
      onLayout={() => setShown(true)}>
      <View style={styles.icon}>
        <Animated.View style={[styles.shadow, introStyle]} />
        <Image source={require('../../assets/splash/splash-icon.png')} style={styles.image} />
      </View>
      <Animated.View style={[styles.text, introStyle]}>
        <Text style={styles.name}>{t.splash.appName}</Text>
        <Text style={styles.tagline}>{t.splash.tagline}</Text>
      </Animated.View>
    </Animated.View>
  );
};

interface Props {
  ready: boolean;
  children: ReactNode;
}

const SplashGate: React.FC<Props> = ({ ready, children }) => {
  const [splashVisible, setSplashVisible] = useState(true);

  return (
    <View style={styles.root}>
      <StatusBar style={splashVisible ? 'light' : 'dark'} />
      {ready ? children : null}
      {splashVisible ? (
        <SplashOverlay ready={ready} onFinish={() => setSplashVisible(false)} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.accent,
  },
  icon: { width: IMAGE_SIZE, height: IMAGE_SIZE },
  shadow: {
    position: 'absolute',
    top: (IMAGE_SIZE - ICON_BOX) / 2,
    left: (IMAGE_SIZE - ICON_BOX) / 2,
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: ICON_RADIUS,
    backgroundColor: UI.surface,
    boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.22)',
  },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE },
  text: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: ICON_BOX / 2 + TEXT_GAP,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  name: { fontSize: 30, fontWeight: '800', color: UI.onAccent },
  tagline: { fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center' },
});

export { SplashGate };
