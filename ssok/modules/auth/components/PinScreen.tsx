import React, { useState, useCallback, memo } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '@/constants/colors';
import PinDots from '@/modules/auth/components/PinDots';
import PinKeypad from '@/modules/auth/components/PinKeypad';
import usePinInput from '@/modules/auth/hooks/usePin';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { useLoadingStore } from '@/stores/loadingStore';
import useDialog from '@/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';

interface PinScreenProps {
  title: string;
  subtitle?: string;
  maxLength?: number;
  onComplete: (pin: string) => Promise<boolean> | boolean;
  errorDuration?: number;
  isLoading?: boolean;
}

/**
 * PIN 입력 화면 컴포넌트
 *
 * 6자리 PIN 번호를 입력받는 화면으로, 로그인과 PIN 설정에 사용됩니다.
 * 숫자 키패드와 PIN 표시 점으로 구성되어 있습니다.
 */
const PinScreen: React.FC<PinScreenProps> = ({
  title,
  subtitle,
  maxLength = 6,
  onComplete,
  errorDuration = 1000,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { startLoading, stopLoading } = useLoadingStore();
  const { dialogState, showDialog, hideDialog, handleConfirm, handleCancel } =
    useDialog();

  // PIN 입력 완료 시 처리 (이 함수는 props로 전달되는 usePinInput 훅의 의존성이므로 useCallback 유지)
  const handlePinComplete = useCallback(
    async (pin: string) => {
      try {
        startLoading();
        const isSuccess = await onComplete(pin);

        if (!isSuccess) {
          setErrorMessage('PIN 번호가 일치하지 않습니다.');
          setTimeout(() => {
            resetPin();
            setErrorMessage('');
          }, errorDuration);
          return false;
        }
        return true;
      } catch (error) {
        console.error('[ERROR] PIN 처리 중 오류:', error);
        showDialog({
          title: '오류',
          content: '처리 중 오류가 발생했습니다.',
          confirmText: '확인',
        });
        return false;
      } finally {
        stopLoading();
      }
    },
    [onComplete, startLoading, stopLoading, errorDuration, showDialog],
  );

  // PIN 입력 훅 사용
  const { inputPin, handlePressNumber, handleDelete, resetPin } = usePinInput({
    maxLength,
    onComplete: handlePinComplete,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.content}>
        <Text style={[typography.h2, styles.title]}>{title}</Text>

        {subtitle && (
          <Text style={[typography.body1, styles.subtitle]}>{subtitle}</Text>
        )}

        <View style={styles.pinSection}>
          <PinDots
            inputLength={inputPin.length}
            maxLength={maxLength}
            hasError={!!errorMessage}
            length={inputPin.length}
          />

          <View style={styles.errorContainer}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
        </View>

        <PinKeypad
          onPressNumber={handlePressNumber}
          onPressDelete={handleDelete}
        />
      </View>

      <DialogProvider
        visible={dialogState.visible}
        title={dialogState.title}
        content={dialogState.content}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onDismiss={hideDialog}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 80,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.tertiary,
  },
  pinSection: {
    alignItems: 'center',
  },
  errorContainer: {
    height: 24,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    ...typography.body2,
  },
});

export default memo(PinScreen);
