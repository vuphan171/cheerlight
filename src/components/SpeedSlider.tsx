import { useRef } from 'react';
import {
  type GestureResponderEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SPEED_MAX, SPEED_MIN } from '@/constants/effects';
import { UI } from '@/constants/ui';

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  /** Hiển thị giá trị, mặc định là chính số đó. */
  formatValue?: (value: number) => string;
}

/**
 * Slider rời rạc (mặc định 1–10) viết bằng responder system của RN, để không thêm thư viện
 * slider ngoài danh sách. Kéo hoặc chạm vào bất kỳ đâu trên thanh để chọn.
 */
export function SpeedSlider({
  value,
  onChange,
  min = SPEED_MIN,
  max = SPEED_MAX,
  label,
  formatValue = String,
}: SpeedSliderProps) {
  const railRef = useRef<View>(null);
  const track = useRef({ x: 0, width: 1 });
  const steps = max - min + 1;
  const fraction = (value - min) / (max - min);

  const measure = () => {
    railRef.current?.measureInWindow((x, _y, width) => {
      track.current = { x, width: Math.max(1, width) };
    });
  };

  const handleTouch = (e: GestureResponderEvent) => {
    const { x, width } = track.current;
    const t = Math.min(1, Math.max(0, (e.nativeEvent.pageX - x) / width));
    const next = Math.round(min + t * (max - min));
    if (next !== value) onChange(next);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{formatValue(value)}</Text>
        </View>
      ) : null}
      {/* Vùng chạm rộng hết cỡ (kể cả phần núm thò ra hai đầu); vị trí tính theo `rail`. */}
      <View
        style={styles.touchArea}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') onChange(Math.min(max, value + 1));
          if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(min, value - 1));
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => {
          // Đo lại phòng khi ScrollView đã cuộn kể từ lần layout trước.
          measure();
          handleTouch(e);
        }}
        onResponderMove={handleTouch}>
        <View ref={railRef} onLayout={measure} style={styles.rail} pointerEvents="none">
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
            {Array.from({ length: steps }, (_, i) => (
              <View
                key={i}
                style={[styles.tick, { left: `${(i / (steps - 1)) * 100}%` }]}
                pointerEvents="none"
              />
            ))}
          </View>
          <View style={[styles.thumb, { left: `${fraction * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const THUMB = 26;

const styles = StyleSheet.create({
  container: { gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: UI.textMuted, fontSize: 14 },
  value: { color: UI.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  touchArea: { height: 44, justifyContent: 'center', paddingHorizontal: THUMB / 2 },
  rail: { justifyContent: 'center', height: THUMB },
  track: { height: 6, borderRadius: 3, backgroundColor: UI.surfaceRaised },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3, backgroundColor: UI.accent },
  tick: {
    position: 'absolute',
    top: 1,
    width: 4,
    height: 4,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: UI.border,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    marginLeft: -THUMB / 2,
    borderRadius: THUMB / 2,
    backgroundColor: UI.text,
  },
});
