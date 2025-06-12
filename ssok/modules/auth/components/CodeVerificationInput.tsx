import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { Text } from '@/components/TextProvider';
import CustomTextInput from '@/components/TextInput';
import { colors } from '@/constants/colors';

interface CodeVerificationInputProps {
  verificationCode: string;
  onChangeVerificationCode: (text: string) => void;
  error?: string;
  onVerifyCode: () => void;
  isLoading: boolean;
  verificationConfirmed: boolean;
  disabled?: boolean;
}

/**
 * 인증번호 입력과 확인 버튼을 포함하는 컴포넌트
 */
const CodeVerificationInput: React.FC<CodeVerificationInputProps> = ({
  verificationCode,
  onChangeVerificationCode,
  error,
  onVerifyCode,
  isLoading,
  verificationConfirmed,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <CustomTextInput
        label="인증번호"
        value={verificationCode}
        onChangeText={onChangeVerificationCode}
        placeholder="인증번호 6자리 입력"
        error={error}
        keyboardType="numeric"
        containerStyle={styles.input}
        disabled={disabled || verificationConfirmed}
      />
      <Pressable
        style={[
          styles.button,
          (verificationConfirmed ||
            !verificationCode ||
            disabled ||
            isLoading) &&
            styles.disabledButton,
        ]}
        onPress={onVerifyCode}
        disabled={
          verificationConfirmed || !verificationCode || disabled || isLoading
        }
      >
        <Text style={styles.buttonText}>
          {verificationConfirmed ? '인증완료' : '인증확인'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  input: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    minWidth: 100,
    height: 48,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
});

export default CodeVerificationInput;
