import { Text, type StyleProp, type TextStyle } from 'react-native';

import { ICON_FONT_FAMILY } from '@/configs/fonts';

/** Mã glyph Ionicons (lấy từ glyphmap của @react-native-vector-icons/ionicons). Chỉ giữ icon app dùng. */
const GLYPHS = {
  albums: 61711,
  'albums-outline': 61712,
  'color-palette': 62077,
  'color-palette-outline': 62078,
  settings: 62827,
  'settings-outline': 62828,
  play: 62662,
  'ellipsis-horizontal': 62158,
  add: 61699,
  checkmark: 61981,
  'chevron-forward': 62011,
  'chevron-back': 61993,
  'lock-closed': 62407,
  flash: 62230,
  pulse: 62710,
  time: 62941,
  'hand-left': 62299,
  sunny: 62893,
  'trash-outline': 62966,
  remove: 62752,
  camera: 61915,
  warning: 63016,
  close: 62026,
  sparkles: 62860,
  'arrow-back': 61735,
  'arrow-forward': 61747,
  'information-circle': 62360,
  pencil: 62620,
  'copy-outline': 62096,
} as const;

export type IconName = keyof typeof GLYPHS;

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 20, color, style }: IconProps) {
  return (
    <Text
      allowFontScaling={false}
      style={[{ fontFamily: ICON_FONT_FAMILY, fontSize: size, lineHeight: size, color }, style]}>
      {String.fromCodePoint(GLYPHS[name])}
    </Text>
  );
}
