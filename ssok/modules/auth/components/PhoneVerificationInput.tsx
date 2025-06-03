import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/TextProvider';
import CustomTextInput from '@/components/TextInput';
import { colors } from '@/constants/colors';

interface PhoneVerificationInputProps {
  phoneNumber: string;
  onChangePhoneNumber: (text: string) => void;
  error?: string;
  onSendVerification: () => void;
  isLoading: boolean;
  verificationSent: boolean;
  disabled?: boolean;
}

/**
 * 휴대폰 번호 입력과 인증번호 발송 버튼을 포함하는 컴포넌트
 */
const PhoneVerificationInput: React.FC<PhoneVerificationInputProps> = ({
  phoneNumber,
  onChangePhoneNumber,
  error,
  onSendVerification,
  isLoading,
  verificationSent,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <CustomTextInput
        label="휴대폰 번호"
        value={phoneNumber}
        onChangeText={onChangePhoneNumber}
        placeholder="010-1234-5678"
        error={error}
        keyboardType="phone-pad"
        containerStyle={styles.input}
        disabled={disabled}
      />
      <TouchableOpacity
        style={[
          styles.button,
          (verificationSent || !phoneNumber || disabled || isLoading) &&
            styles.disabledButton,
        ]}
        onPress={onSendVerification}
        disabled={verificationSent || !phoneNumber || disabled || isLoading}
      >
        <Text style={styles.buttonText}>
          {verificationSent ? '재발송' : '인증번호 발송'}
        </Text>
      </TouchableOpacity>
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

export default PhoneVerificationInput;
