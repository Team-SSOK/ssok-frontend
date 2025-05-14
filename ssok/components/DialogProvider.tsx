import React from 'react';
import { Dialog, Portal, Button, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';

interface DialogProviderProps {
  visible: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss: () => void;
}

/**
 * 앱 전체에서 사용할 Dialog 컴포넌트
 */
const DialogProvider: React.FC<DialogProviderProps> = ({
  visible,
  title,
  content,
  confirmText = '확인',
  cancelText,
  onConfirm,
  onCancel,
  onDismiss,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.content}>{content}</Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          {cancelText && (
            <Button
              mode="text"
              onPress={onCancel || onDismiss}
              textColor={colors.grey}
              style={styles.button}
            >
              {cancelText}
            </Button>
          )}
          <Button
            mode="contained"
            onPress={onConfirm || onDismiss}
            buttonColor={colors.primary}
            style={styles.button}
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: colors.mGrey,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: 8,
    paddingHorizontal: 16,
  },
});

export default DialogProvider;
