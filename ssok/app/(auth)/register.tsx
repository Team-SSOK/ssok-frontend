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
import { useAuthStore, type AuthUser } from '@/modules/auth/store/authStore'; // useAuthStore, AuthUser import

// Auth 모듈 임포트
import { authApi } from '@/modules/auth/api'; // authApi는 계속 사용
import { useRegisterForm } from '@/modules/auth/hooks/useRegisterForm';
import {
  PhoneVerificationInput,
  CodeVerificationInput,
} from '@/modules/auth/components';
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '@/modules/auth/utils/constants';
import useDialog from '@/modules/auth/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';

export default function Register() {
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

  // authStore 사용
  const {
    isLoading,
    // error, // error 상태는 showDialog로 직접 처리하거나, 필요시 authStore.error 사용
    setIsLoading,
    clearError,
    saveRegistrationInfo, // 회원가입 정보 임시 저장 함수
    // login, // pin-setup에서 사용
  } = useAuthStore();

  // 로컬 상태로 휴대폰 인증 관련 상태 관리 (authStore에 통합하거나 로컬 유지)
  const [verificationSent, setVerificationSentLocal] = React.useState(false);
  const [verificationConfirmed, setVerificationConfirmedLocal] =
    React.useState(false);
  // 세부 로딩 상태 (authStore.isLoading이 전반적인 API 로딩을 담당)
  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = React.useState(false);

  const { dialogState, showDialog, hideDialog } = useDialog(); // handleConfirm, handleCancel 제거 (DialogProvider에서 직접 처리)

  const sendVerificationCode = useCallback(async () => {
    if (!validatePhone()) return;
    setIsSendingCode(true);
    // setIsLoading(true); // authStore의 로딩 상태 사용 시
    clearError();

    try {
      const response = await authApi.sendVerificationCode({
        phoneNumber: form.phoneNumber,
      });
      if (response.data.isSuccess) {
        setVerificationSentLocal(true);
        showDialog({
          title: '인증번호 발송',
          content: SUCCESS_MESSAGES.CODE_SENT,
          confirmText: '확인',
        });
      } else {
        console.log(response.data);
        // authStore.setError(response.data.message || ERROR_MESSAGES.SEND_CODE_ERROR);
        showDialog({
          title: '오류',
          content: response.data.message || ERROR_MESSAGES.SEND_CODE_ERROR,
          confirmText: '확인',
        });
      }
    } catch (err) {
      // authStore.setError(ERROR_MESSAGES.SEND_CODE_ERROR);
      console.log(err);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.SEND_CODE_ERROR,
        confirmText: '확인',
      });
    } finally {
      setIsSendingCode(false);
      // setIsLoading(false);
    }
  }, [
    form.phoneNumber,
    validatePhone,
    // setIsLoading,
    clearError,
    showDialog,
  ]);

  const verifyCode = useCallback(async () => {
    if (!validateVerificationCode()) return;
    setIsVerifyingCode(true);
    // setIsLoading(true);
    clearError();

    try {
      const response = await authApi.verifyCode({
        phoneNumber: form.phoneNumber,
        verificationCode: form.verificationCode,
      });

      if (response.data.isSuccess) {
        setVerificationConfirmedLocal(true);
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
        // authStore.setError(ERROR_MESSAGES.INVALID_VERIFICATION_CODE);
      }
    } catch (err) {
      console.log(err);
      // authStore.setError(ERROR_MESSAGES.VERIFY_CODE_ERROR);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.VERIFY_CODE_ERROR,
        confirmText: '확인',
      });
    } finally {
      setIsVerifyingCode(false);
      // setIsLoading(false);
    }
  }, [
    form.phoneNumber,
    form.verificationCode,
    validateVerificationCode,
    // setIsLoading,
    clearError,
    setErrors,
    showDialog,
  ]);

  // 다음 단계 (PIN 설정)로 이동
  const goToPinSetup = useCallback(async () => {
    if (!validateForm(!verificationConfirmed) || !form.agreedToTerms) return;

    setIsLoading(true); // authStore의 로딩 사용 (화면 전환 전)
    clearError();

    try {
      // 사용자 정보 (이름, 생년월일, 전화번호)를 authStore에 임시 저장
      saveRegistrationInfo(
        form.username.trim(),
        form.phoneNumber, // 이미 하이픈 제거된 형태라고 가정 (useRegisterForm에서 처리)
        form.birthDate.trim(),
        '', // PIN은 다음 단계에서 설정되므로 빈 문자열 전달
      );
      // PIN 설정 화면으로 이동
      router.push('/(auth)/pin-setup');
    } catch (err) {
      console.error('Error in registration process (saving info):', err);
      // authStore.setError(ERROR_MESSAGES.REGISTRATION_ERROR);
      showDialog({
        title: '오류',
        content: ERROR_MESSAGES.REGISTRATION_ERROR,
        confirmText: '확인',
      });
    } finally {
      setIsLoading(false); // 성공/실패 관계없이 로딩 해제
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

  const isDisabled = !isFormComplete(verificationConfirmed) || isLoading; // authStore의 isLoading 사용

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
            disabled={isLoading} // 로딩 중 비활성화
          />
          <CustomTextInput
            label="생년월일"
            value={form.birthDate}
            onChangeText={(text) => handleChange('birthDate', text)}
            placeholder="YYYYMMDD"
            error={errors.birthDate}
            keyboardType="numeric"
            disabled={isLoading} // 로딩 중 비활성화
          />
          <PhoneVerificationInput
            phoneNumber={form.phoneNumber}
            onChangePhoneNumber={(text) => handleChange('phoneNumber', text)}
            error={errors.phoneNumber}
            onSendVerification={sendVerificationCode}
            isLoading={isSendingCode} // 개별 로딩 상태 사용
            verificationSent={verificationSent}
            disabled={verificationConfirmed || isLoading} // 인증 완료 또는 전체 로딩 중 비활성화
          />
          {verificationSent && !verificationConfirmed && (
            <CodeVerificationInput
              verificationCode={form.verificationCode}
              onChangeVerificationCode={(text) =>
                handleChange('verificationCode', text)
              }
              error={errors.verificationCode}
              onVerifyCode={verifyCode}
              isLoading={isVerifyingCode} // 개별 로딩 상태 사용
              disabled={isLoading} // 전체 로딩 중 비활성화
              verificationConfirmed={verificationConfirmed}
            />
          )}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleChange('agreedToTerms', !form.agreedToTerms)}
              disabled={isLoading} // 로딩 중 비활성화
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
            onPress={goToPinSetup} // 함수 이름 변경: handleRegister -> goToPinSetup
            disabled={isDisabled}
            loading={isLoading} // isLoading -> loading
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
