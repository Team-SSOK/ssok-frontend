import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  TextInput as PaperTextInput,
  HelperText,
  useTheme,
  Text,
} from 'react-native-paper';
import type { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { colors } from '@/constants/colors';

interface CustomTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  startIcon?: IconSource;
  endIcon?: IconSource;
  onEndIconPress?: () => void;
  secureTextEntry?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  maxLength?: number;
  style?: any;
  containerStyle?: any;
  contentStyle?: any;
  dense?: boolean;
  required?: boolean;
  labelColor?: string;
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad';
  mode?: 'flat' | 'outlined';
  placeholder?: string;
  placeholderTextColor?: string;
}

/**
 * 커스텀 텍스트 인풋 컴포넌트
 *
 * React Native Paper의 TextInput을 기반으로 한 사용하기 쉬운 텍스트 입력 컴포넌트
 */
const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  helperText,
  startIcon,
  endIcon,
  onEndIconPress,
  secureTextEntry = false,
  disabled = false,
  multiline = false,
  maxLength,
  style,
  containerStyle,
  dense = false,
  required = false,
  keyboardType = 'default',
  mode = 'flat',
  contentStyle,
  placeholder,
  placeholderTextColor,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextVisible, setIsSecureTextVisible] =
    useState(!secureTextEntry);
  const theme = useTheme();

  // 보안 텍스트 토글 함수
  const toggleSecureText = () => {
    setIsSecureTextVisible((prev) => !prev);
  };

  // 실제 아이콘 설정
  const getEndIcon = (): IconSource => {
    if (secureTextEntry) {
      return isSecureTextVisible ? 'eye-off' : 'eye';
    }
    return endIcon || '';
  };

  // 실제 아이콘 처리 함수
  const handleEndIconPress = () => {
    if (secureTextEntry) {
      toggleSecureText();
    } else if (onEndIconPress) {
      onEndIconPress();
    }
  };

  // 값이 변경될 때 maxLength 처리
  const handleChangeText = (text: string) => {
    if (maxLength && text.length > maxLength) {
      onChangeText(text.slice(0, maxLength));
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 라벨이 있고 required인 경우 별표 표시 */}
      {required && (
        <Text style={styles.requiredLabel}>
          {label} <Text style={styles.requiredStar}>*</Text>
        </Text>
      )}

      <PaperTextInput
        label={!required ? label : ''}
        value={value}
        onChangeText={handleChangeText}
        error={!!error}
        disabled={disabled}
        mode={mode}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        left={startIcon ? <PaperTextInput.Icon icon={startIcon} /> : undefined}
        right={
          endIcon || secureTextEntry ? (
            <PaperTextInput.Icon
              icon={getEndIcon()}
              onPress={handleEndIconPress}
              forceTextInputFocus={false}
            />
          ) : undefined
        }
        secureTextEntry={secureTextEntry && !isSecureTextVisible}
        style={[
          styles.input,
          isFocused && styles.focusedInput,
          multiline && styles.multilineInput,
          error && styles.errorInput,
          style,
        ]}
        dense={dense}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        contentStyle={contentStyle}
        theme={{
          colors: {
            primary: colors.primary,
            error: colors.error,
            onSurfaceVariant: colors.lGrey, // 라벨 색상
          },
        }}
        underlineColor={colors.silver}
      />

      {/* 에러 또는 도움말 텍스트 */}
      {(error || helperText) && (
        <HelperText
          type={error ? 'error' : 'info'}
          visible={true}
          style={styles.helperText}
        >
          {error || helperText}
        </HelperText>
      )}

      {/* maxLength가 설정된 경우 글자 수 표시 */}
      {maxLength && (
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: colors.white,
    fontSize: 18,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: colors.silver,
  },
  focusedInput: {
    borderColor: colors.primary,
  },
  multilineInput: {
    minHeight: 100,
  },
  errorInput: {
    borderColor: colors.error,
  },
  outline: {
    borderRadius: 8,
    borderWidth: 2,
  },
  focusedOutline: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  errorOutline: {
    borderColor: colors.error,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: colors.grey,
    marginTop: 4,
  },
  requiredLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.silver,
  },
  requiredStar: {
    color: colors.error,
  },
});

export default CustomTextInput;
