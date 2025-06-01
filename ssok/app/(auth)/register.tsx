import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';

import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import Header from '@/components/Header';
import CustomTextInput from '@/components/CustomTextInput';
import { Text } from '@/components/TextProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useRegisterForm } from '@/modules/auth/hooks/useRegisterForm';
import {
  PhoneVerificationInput,
  CodeVerificationInput,
} from '@/modules/auth/components';
import { ERROR_MESSAGES } from '@/modules/auth/utils/constants';
import useDialog from '@/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';

export default function Register() {
  const { form, errors, handleChange, validateForm, isFormComplete } =
    useRegisterForm();

  const {
    isLoading,
    verificationSent,
    verificationConfirmed,
    isSendingCode,
    isVerifyingCode,
    error,
    setIsLoading,
    clearError,
    saveRegistrationInfo,
    sendVerificationCode,
    verifyCode,
    resetVerification,
  } = useAuthStore();

  const { dialogState, showDialog, hideDialog } = useDialog();

  const handleSendVerificationCode = useCallback(async () => {
    clearError();
    const result = await sendVerificationCode(form.phoneNumber);

    if (result.success) {
      showDialog({
        title: '인증번호 발송',
        content: '인증번호가 발송되었습니다.',
        confirmText: '확인',
      });
    } else {
      showDialog({
        title: '오류',
        content: result.message || ERROR_MESSAGES.SEND_CODE_ERROR,
        confirmText: '확인',
      });
    }
  }, [form.phoneNumber, sendVerificationCode, clearError, showDialog]);

  const handleVerifyCode = useCallback(async () => {
    clearError();
    const result = await verifyCode(form.phoneNumber, form.verificationCode);

    if (result.success) {
      showDialog({
        title: '인증 성공',
        content: '휴대폰 인증이 완료되었습니다.',
        confirmText: '확인',
      });
    } else {
      showDialog({
        title: '오류',
        content: result.message || ERROR_MESSAGES.VERIFY_CODE_ERROR,
        confirmText: '확인',
      });
    }
  }, [
    form.phoneNumber,
    form.verificationCode,
    verifyCode,
    clearError,
    showDialog,
  ]);

  const goToPinSetup = useCallback(async () => {
    if (!validateForm(false) || !verificationConfirmed || !form.agreedToTerms)
      return;

    setIsLoading(true);
    clearError();

    try {
      saveRegistrationInfo(
        form.username.trim(),
        form.phoneNumber,
        form.birthDate.trim(),
        '',
      );
      router.push('/(auth)/pin-setup');
    } catch (err) {
      console.error('Error in registration process:', err);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.REGISTRATION_ERROR,
        confirmText: '확인',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    form,
    verificationConfirmed,
    validateForm,
    setIsLoading,
    clearError,
    saveRegistrationInfo,
    showDialog,
  ]);

  const isDisabled =
    !isFormComplete(verificationConfirmed) ||
    !verificationConfirmed ||
    isLoading;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <DialogProvider
          visible={dialogState.visible}
          title={dialogState.title}
          content={dialogState.content}
          confirmText={dialogState.confirmText}
          cancelText={dialogState.cancelText}
          onConfirm={dialogState.onConfirm || hideDialog}
          onCancel={dialogState.onCancel || hideDialog}
          onDismiss={hideDialog}
        />
        <Header title="회원가입" />
        <View style={styles.content}>
          <CustomTextInput
            label="이름"
            value={form.username}
            onChangeText={(text) => handleChange('username', text)}
            placeholder="이름을 입력해주세요"
            error={errors.username}
            disabled={isLoading}
          />
          <CustomTextInput
            label="생년월일"
            value={form.birthDate}
            onChangeText={(text) => handleChange('birthDate', text)}
            placeholder="YYYYMMDD"
            error={errors.birthDate}
            keyboardType="numeric"
            disabled={isLoading}
          />
          <PhoneVerificationInput
            phoneNumber={form.phoneNumber}
            onChangePhoneNumber={(text) => handleChange('phoneNumber', text)}
            error={errors.phoneNumber}
            onSendVerification={handleSendVerificationCode}
            isLoading={isSendingCode}
            verificationSent={verificationSent}
            disabled={verificationConfirmed || isLoading}
          />
          {verificationSent && !verificationConfirmed && (
            <CodeVerificationInput
              verificationCode={form.verificationCode}
              onChangeVerificationCode={(text) =>
                handleChange('verificationCode', text)
              }
              error={errors.verificationCode}
              onVerifyCode={handleVerifyCode}
              isLoading={isVerifyingCode}
              disabled={isLoading}
              verificationConfirmed={verificationConfirmed}
            />
          )}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleChange('agreedToTerms', !form.agreedToTerms)}
              disabled={isLoading}
            >
              {form.agreedToTerms ? (
                <Ionicons name="checkbox" size={24} color={colors.primary} />
              ) : (
                <Ionicons name="square-outline" size={24} color={colors.grey} />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>서비스 이용약관에 동의합니다.</Text>
          </View>
          <Button
            title="다음"
            onPress={goToPinSetup}
            disabled={isDisabled}
            loading={isLoading}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 36,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  checkbox: {
    marginRight: 10,
  },
  termsText: {
    fontSize: 14,
    color: colors.black,
  },
});
