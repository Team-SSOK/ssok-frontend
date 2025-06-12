import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'disabled';
  size?: 'small' | 'medium' | 'large';
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  fullWidth?: boolean;
  loading?: boolean;
}

export const CommonButton: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled,
  textStyle,
  buttonStyle,
  fullWidth = false,
  loading = false,
  ...props
}) => {
  // 버튼 스타일 계산
  const getButtonStyles = () => {
    let baseStyle: ViewStyle = {
      ...styles.button,
      ...getSizeStyle(),
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // 버튼 타입에 따른 스타일
    switch (variant) {
      case 'primary':
        baseStyle = {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
        break;
      case 'secondary':
        baseStyle = {
          ...baseStyle,
          backgroundColor: colors.white,
        };
        break;
      case 'outline':
        baseStyle = {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
        break;
      case 'disabled':
        baseStyle = {
          ...baseStyle,
          backgroundColor: colors.disabled,
        };
        break;
    }

    // 비활성화 상태 스타일
    if (disabled || loading) {
      baseStyle = {
        ...baseStyle,
        backgroundColor: colors.disabled,
      };
    }

    return baseStyle;
  };

  // 텍스트 스타일 계산
  const getTextStyles = () => {
    let baseStyle: TextStyle = {
      ...styles.text,
    };

    // 버튼 크기에 따른 텍스트 스타일
    switch (size) {
      case 'small':
        baseStyle = {
          ...baseStyle,
          fontSize: 14,
        };
        break;
      case 'medium':
        baseStyle = {
          ...baseStyle,
          fontSize: 16,
        };
        break;
      case 'large':
        baseStyle = {
          ...baseStyle,
          fontSize: 18,
        };
        break;
    }

    // 버튼 타입에 따른 텍스트 색상
    switch (variant) {
      case 'primary':
        baseStyle = {
          ...baseStyle,
          color: colors.white,
        };
        break;
      case 'secondary':
        baseStyle = {
          ...baseStyle,
          color: colors.primary,
        };
        break;
      case 'outline':
        baseStyle = {
          ...baseStyle,
          color: colors.primary,
        };
        break;
      case 'disabled':
        baseStyle = {
          ...baseStyle,
          color: colors.white,
        };
        break;
    }

    // 비활성화 상태 텍스트 스타일
    if (disabled || loading) {
      baseStyle = {
        ...baseStyle,
        color: colors.white,
      };
    }

    return baseStyle;
  };

  // 크기에 따른 패딩 조정
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
    }
  };

  // 로딩 인디케이터 색상 계산
  const getLoaderColor = () => {
    switch (variant) {
      case 'primary':
        return colors.white;
      case 'secondary':
      case 'outline':
        return colors.primary;
      default:
        return colors.white;
    }
  };

  return (
    <Pressable
      {...props}
      disabled={disabled || variant === 'disabled' || loading}
      style={[getButtonStyles(), buttonStyle]}
    >
      {loading ? (
        <ActivityIndicator
          color={getLoaderColor()}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});

export default CommonButton;
