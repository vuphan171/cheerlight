import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RADII, TYPE, UI } from '@/configs/ui';

export interface DialogAction {
  label: string;
  onPress: () => void;
  /** 'primary' = accent đậm, 'danger' = chữ đỏ, mặc định = chữ accent. */
  kind?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: ReactNode;
  children?: ReactNode;
  actions: DialogAction[];
  onRequestClose: () => void;
}

/** Hộp thoại tông sáng (cảnh báo Strobe, đặt tên mẫu, chọn tuỳ chọn…). Xác nhận xoá vẫn dùng `Alert`. */
export function ConfirmDialog({
  visible,
  title,
  message,
  icon,
  children,
  actions,
  onRequestClose,
}: ConfirmDialogProps) {
  const stacked = actions.length > 2;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onRequestClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <View style={styles.body}>
            {icon}
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {children}
          </View>
          <View style={[styles.actions, stacked && styles.actionsStacked]}>
            {actions.map((action, i) => (
              <Pressable
                key={action.label}
                disabled={action.disabled}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.action,
                  !stacked && i > 0 && styles.actionDivider,
                  stacked && i > 0 && styles.actionDividerTop,
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.actionLabel,
                    action.kind === 'primary' && styles.primary,
                    action.kind === 'danger' && styles.danger,
                    action.disabled && styles.disabled,
                  ]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: UI.surface,
    borderRadius: RADII.dialog,
    overflow: 'hidden',
  },
  body: { padding: 20, paddingBottom: 16, gap: 10, alignItems: 'stretch' },
  title: { ...TYPE.navTitle, textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, color: UI.label, textAlign: 'center' },
  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UI.separator,
  },
  actionsStacked: { flexDirection: 'column' },
  action: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionDivider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: UI.separator },
  actionDividerTop: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: UI.separator },
  pressed: { backgroundColor: 'rgba(0,0,0,0.06)' },
  actionLabel: { fontSize: 17, color: UI.accent, textAlign: 'center' },
  primary: { fontWeight: '600' },
  danger: { color: UI.danger },
  disabled: { opacity: 0.35 },
});

/** Ô nhập dùng trong ConfirmDialog. */
export const dialogInputStyle = {
  fontSize: 17,
  color: UI.label,
  backgroundColor: UI.bg,
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: UI.separator,
} as const;
