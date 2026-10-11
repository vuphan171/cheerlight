import { useRef, type ReactNode } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { SHADOW, TYPE, UI } from '@/configs/ui';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  minLabel?: ReactNode;
  maxLabel?: ReactNode;
}

/**
 * Slider rời rạc viết bằng responder system của RN (không thêm thư viện slider native).
 * Kéo hoặc chạm vào bất kỳ đâu trên thanh để chọn.
 */
export function Slider({ value, onChange, min, max, minLabel, maxLabel }: SliderProps) {
  const railRef = useRef<View>(null);
  const track = useRef({ x: 0, width: 1 });
  const fraction = max > min ? (value - min) / (max - min) : 0;

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
    <View style={styles.row}>
      {typeof minLabel === 'string' ? <Text style={styles.endLabel}>{minLabel}</Text> : minLabel}
      <View
        style={styles.touchArea}
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
          </View>
          <View style={[styles.thumb, SHADOW.small, { left: `${fraction * 100}%` }]} />
        </View>
      </View>
      {typeof maxLabel === 'string' ? <Text style={styles.endLabel}>{maxLabel}</Text> : maxLabel}
    </View>
  );
}

const THUMB = 28;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  endLabel: { ...TYPE.caption, fontSize: 15 },
  touchArea: { flex: 1, height: 44, justifyContent: 'center', paddingHorizontal: THUMB / 2 },
  rail: { justifyContent: 'center', height: THUMB },
  track: { height: 4, borderRadius: 2, backgroundColor: UI.fill },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
    backgroundColor: UI.accent,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    marginLeft: -THUMB / 2,
    borderRadius: THUMB / 2,
    backgroundColor: UI.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.04)',
  },
});
