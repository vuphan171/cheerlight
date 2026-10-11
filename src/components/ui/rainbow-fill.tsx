import { Image, StyleSheet } from 'react-native';

export function RainbowFill() {
  return (
    <Image
      source={require('../../../assets/images/rainbow.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
  );
}
