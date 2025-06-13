import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Keyboard,
} from 'react-native';
import { Text } from '@/components/TextProvider';
import { colors } from '@/constants/colors';
import { typography } from '@/theme/typography';

interface CodeVerificationInputProps {
  verificationCode: string;
  onChangeVerificationCode: (text: string) => void;
  onVerifyCode: () => void;
  isLoading: boolean;
  verificationConfirmed: boolean;
  disabled?: boolean;
}

const CODE_LENGTH = 6;

const CodeVerificationInput: React.FC<CodeVerificationInputProps> = ({
  verificationCode,
  onChangeVerificationCode,
  onVerifyCode,
  isLoading,
  verificationConfirmed,
  disabled = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (
      verificationCode.length === CODE_LENGTH &&
      !isLoading &&
      !verificationConfirmed
    ) {
      onVerifyCode();
    }
  }, [verificationCode, isLoading, verificationConfirmed, onVerifyCode]);

  useEffect(() => {
    if (verificationConfirmed) {
      Keyboard.dismiss();
    }
  }, [verificationConfirmed]);

  const handlePress = () => {
    if (!disabled && !verificationConfirmed) {
      inputRef.current?.focus();
    }
  };

  const renderInputBoxes = () => {
    return Array.from({ length: CODE_LENGTH }).map((_, i) => {
      const digit = verificationCode[i] || '';
      const isCurrent = i === verificationCode.length;

      return (
        <View
          key={i}
          style={[
            styles.inputBox,
            isFocused &&
              isCurrent &&
              !verificationConfirmed &&
              styles.inputBoxFocused,
            verificationConfirmed && styles.inputBoxVerified,
            !!digit && !verificationConfirmed && styles.inputBoxFilled,
          ]}
        >
          <Text style={styles.inputText}>{digit}</Text>
        </View>
      );
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.inputContainer}>{renderInputBoxes()}</View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={verificationCode}
        onChangeText={text => {
          if (!isLoading && !verificationConfirmed) {
            onChangeVerificationCode(text.replace(/[^0-9]/g, ''));
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="numeric"
        maxLength={CODE_LENGTH}
        editable={!disabled && !verificationConfirmed && !isLoading}
        caretHidden
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  inputBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  inputBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputBoxFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputBoxVerified: {
    backgroundColor: colors.silver,
    borderColor: colors.border,
  },
  inputText: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default CodeVerificationInput;
