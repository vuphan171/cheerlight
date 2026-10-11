import { Image, StyleSheet } from 'react-native';

/** Nền gradient cầu vồng tĩnh (PNG) cho ô mẫu / thẻ dùng hiệu ứng Cầu vồng. */
export function RainbowFill() {
  return (
    <Image
      source={require('../../../assets/images/rainbow.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
  );
}
