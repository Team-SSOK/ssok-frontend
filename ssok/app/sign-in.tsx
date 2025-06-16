import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/theme/typography';
import SignInHeader from '@/modules/auth/components/SignIn/SignInHeader';
import { Text } from '@/components/TextProvider';
import {
  PhoneVerificationInput,
  CodeVerificationInput,
} from '@/modules/auth/components';
import useSignInFlow from '@/modules/auth/hooks/useSignInFlow';
import DialogProvider from '@/components/DialogProvider';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function SignInScreen() {
  const {
    // 상태
    phoneNumber,
    verificationCode,
    verificationSent,
    verificationConfirmed,
    isLoading,
    
    // 다이얼로그 상태
    dialogState,
    hideDialog,
    
    // 핸들러
    handlePhoneNumberChange,
    setVerificationCode,
    handleSendVerificationCode,
    handleVerifyCode,
  } = useSignInFlow();

  // 로딩 중이면 로딩 인디케이터 표시
  if (isLoading) {
    return <LoadingIndicator visible={true} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        
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
        
        <SignInHeader title="welcome to SSOK" />
        
        <View style={styles.content}>
          {!verificationSent ? (
            <View>
              <View style={styles.titleContainer}>
                <Text style={[typography.h2, styles.title]}>
                  본인 인증을 위해
                </Text>
                <Text style={[typography.h2, styles.title]}>
                  휴대폰 번호를 입력해주세요
                </Text>
                <Text style={[typography.body1, styles.subtitle]}>
                  인증번호를 받으실{'\n'}
                  휴대폰 번호를 입력해주세요.
                </Text>
              </View>
              <PhoneVerificationInput
                phoneNumber={phoneNumber}
                onChangePhoneNumber={handlePhoneNumberChange}
                onSendVerification={handleSendVerificationCode}
                isLoading={isLoading}
                verificationSent={verificationSent}
                error={undefined}
              />
            </View>
          ) : (
            <View>
              <View style={styles.titleContainer}>
                <Text style={[typography.h2, styles.title]}>
                  인증번호를 입력해주세요
                </Text>
                <Text style={[typography.body1, styles.subtitle]}>
                  문자로 전송된 6자리 인증번호를{'\n'}
                  입력해주세요.
                </Text>
              </View>
              <CodeVerificationInput
                verificationCode={verificationCode}
                onChangeVerificationCode={setVerificationCode}
                onVerifyCode={handleVerifyCode}
                isLoading={isLoading}
                verificationConfirmed={verificationConfirmed}
              />
            </View>
          )}
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  titleContainer: {
    marginBottom: 50,
  },
  title: {
    color: colors.text.primary,
    lineHeight: 36,
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: 16,
  },
  flexGrow: {
    flex: 1,
  },
});
