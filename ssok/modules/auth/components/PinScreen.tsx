import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '@/constants/colors';
import PinDots from '@/modules/auth/components/PinDots';
import PinKeypad from '@/modules/auth/components/PinKeypad';
import usePinInput from '@/modules/auth/hooks/usePin';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { useAppLoading } from '@/contexts/LoadingContext';
import useDialog from '@/modules/auth/hooks/useDialog';
import DialogProvider from '@/modules/auth/components/DialogProvider';

interface PinScreenProps {
  title: string;
  maxLength?: number;
  onComplete: (pin: string) => Promise<boolean> | boolean;
}

const PinScreen: React.FC<PinScreenProps> = ({
  title,
  maxLength = 6,
  onComplete,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { isLoading, startLoading, stopLoading } = useAppLoading();
  const { dialogState, showDialog, hideDialog, handleConfirm, handleCancel } =
    useDialog();

  const handlePinComplete = async (pin: string) => {
    try {
      startLoading();
      const isSuccess = await onComplete(pin);

      if (!isSuccess) {
        setErrorMessage('PIN 번호가 일치하지 않습니다.');
        setTimeout(() => {
          resetPin();
          setErrorMessage('');
        }, 1000);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in PIN process:', error);
      showDialog({
        title: '오류',
        content: '처리 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
      return false;
    } finally {
      stopLoading();
    }
  };

  const { inputPin, handlePressNumber, handleDelete, resetPin } = usePinInput({
    maxLength,
    onComplete: handlePinComplete,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.content}>
        <Text style={[typography.h1, styles.title]}>{title}</Text>

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 80,
  },
  title: {
    fontSize: 35,
    color: colors.black,
    marginBottom: 50,
  },
  pinSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  errorContainer: {
    height: 24,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});

export default PinScreen;
