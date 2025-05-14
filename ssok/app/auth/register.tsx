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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import Header from '@/components/Header';
import CustomTextInput from '@/components/CustomTextInput';
import { Text } from '@/components/TextProvider';
import { useLoadingStore } from '@/stores/loadingStore';

// Auth 모듈 임포트
import { authApi } from '@/modules/auth/api';
import { useRegisterForm } from '@/modules/auth/hooks/useRegisterForm';
import { useRegisterState } from '@/modules/auth/hooks/useRegisterState';
import {
  PhoneVerificationInput,
  CodeVerificationInput,
} from '@/modules/auth/components';
import {
  STORAGE_KEYS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '@/modules/auth/utils/constants';
import useDialog from '@/modules/auth/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';

export default function Register() {
  // 폼 상태 및 유효성 검증 관리
  const {
    form,
    errors,
    handleChange,
    validatePhone,
    validateVerificationCode,
    validateForm,
    isFormComplete,
    setErrors,
  } = useRegisterForm();

  // 로딩 및 인증 상태 관리
  const {
    state,
    startLoading,
    stopLoading,
    setVerificationSent,
    setVerificationConfirmed,
  } = useRegisterState();

  // 전역 로딩 상태 관리 - Zustand 사용
  const { startLoading: startGlobalLoading, stopLoading: stopGlobalLoading } =
    useLoadingStore();

  // Dialog 상태 관리
  const { dialogState, showDialog, hideDialog, handleConfirm, handleCancel } =
    useDialog();

  // 인증번호 발송
  const sendVerificationCode = useCallback(async () => {
    if (!validatePhone()) return;

    try {
      // 로딩 상태 시작
      startLoading('sendingCode');

      // API 호출
      const response = await authApi.sendVerificationCode({
        phoneNumber: form.phoneNumber,
      });

      if (response.data.isSuccess) {
        setVerificationSent(true);
        showDialog({
          title: '인증번호 발송',
          content: SUCCESS_MESSAGES.CODE_SENT,
          confirmText: '확인',
        });
      } else {
        showDialog({
          title: '오류',
          content: response.data.message || ERROR_MESSAGES.SEND_CODE_ERROR,
          confirmText: '확인',
        });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.SEND_CODE_ERROR,
        confirmText: '확인',
      });
    } finally {
      // 로딩 상태 종료
      stopLoading('sendingCode');
    }
  }, [
    form.phoneNumber,
    validatePhone,
    startLoading,
    stopLoading,
    setVerificationSent,
    showDialog,
  ]);

  // 인증번호 확인
  const verifyCode = useCallback(async () => {
    if (!validateVerificationCode()) return;

    try {
      // 로딩 상태 시작
      startLoading('verifyingCode');

      // API 호출
      const response = await authApi.verifyCode({
        phoneNumber: form.phoneNumber,
        verificationCode: form.verificationCode,
      });

      if (response.data.isSuccess) {
        setVerificationConfirmed(true);
        showDialog({
          title: '인증 성공',
          content: SUCCESS_MESSAGES.CODE_VERIFIED,
          confirmText: '확인',
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          verificationCode: ERROR_MESSAGES.INVALID_VERIFICATION_CODE,
        }));
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.VERIFY_CODE_ERROR,
        confirmText: '확인',
      });
    } finally {
      // 로딩 상태 종료
      stopLoading('verifyingCode');
    }
  }, [
    form.phoneNumber,
    form.verificationCode,
    validateVerificationCode,
    startLoading,
    stopLoading,
    setVerificationConfirmed,
    setErrors,
    showDialog,
  ]);

  // 회원가입 처리
  const handleRegister = useCallback(async () => {
    // 이미 인증이 완료되었으면 인증 검사를 건너뜁니다
    if (!validateForm(!state.verificationConfirmed) || !form.agreedToTerms)
      return;

    try {
      // 로딩 상태 시작
      startGlobalLoading();

      // 휴대폰 번호 저장 (PIN 설정 후 완전히 등록됨)
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, form.username);
      await AsyncStorage.setItem(STORAGE_KEYS.BIRTH_DATE, form.birthDate);
      await AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, form.phoneNumber);

      // PIN 설정 화면으로 이동
      router.push('/auth/pin-setup');
    } catch (error) {
      console.error('Error in registration process:', error);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.REGISTRATION_ERROR,
        confirmText: '확인',
      });
    } finally {
      // 로딩 상태 종료
      stopGlobalLoading();
    }
  }, [
    form,
    state.verificationConfirmed,
    validateForm,
    startGlobalLoading,
    stopGlobalLoading,
    showDialog,
  ]);

  const isDisabled =
    !isFormComplete(state.verificationConfirmed) || state.loading.registering;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* 헤더 */}
        <Header title="회원가입" />

        <View style={styles.content}>
          {/* 이름 입력 */}
          <CustomTextInput
            label="이름"
            value={form.username}
            onChangeText={(text) => handleChange('username', text)}
            placeholder="이름을 입력해주세요"
            error={errors.username}
          />

          {/* 생년월일 입력 */}
          <CustomTextInput
            label="생년월일"
            value={form.birthDate}
            onChangeText={(text) => handleChange('birthDate', text)}
            placeholder="YYYYMMDD"
            error={errors.birthDate}
            keyboardType="numeric"
          />

          {/* 휴대폰 번호 입력 */}
          <PhoneVerificationInput
            phoneNumber={form.phoneNumber}
            onChangePhoneNumber={(text) => handleChange('phoneNumber', text)}
            error={errors.phoneNumber}
            onSendVerification={sendVerificationCode}
            isLoading={state.loading.sendingCode}
            verificationSent={state.verificationSent}
            disabled={state.verificationConfirmed}
          />

          {/* 인증번호 입력 - 인증번호가 발송된 경우에만 표시 */}
          {state.verificationSent && (
            <CodeVerificationInput
              verificationCode={form.verificationCode}
              onChangeVerificationCode={(text) =>
                handleChange('verificationCode', text)
              }
              error={errors.verificationCode}
              onVerifyCode={verifyCode}
              isLoading={state.loading.verifyingCode}
              verificationConfirmed={state.verificationConfirmed}
            />
          )}

          {/* 약관 동의 */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => handleChange('agreedToTerms', !form.agreedToTerms)}
          >
            <Ionicons
              name={form.agreedToTerms ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={form.agreedToTerms ? colors.primary : colors.grey}
            />
            <Text style={styles.termsText}>약관 동의</Text>
          </TouchableOpacity>

          {/* 회원가입 버튼 */}
          <Button
            title="회원가입"
            variant={isDisabled ? 'disabled' : 'primary'}
            size="large"
            onPress={handleRegister}
            disabled={isDisabled}
            loading={state.loading.registering}
            fullWidth
          />
        </View>

        {/* Dialog 컴포넌트 */}
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
    padding: 40,
    gap: 20,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  termsText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.black,
  },
});
