import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'disabled';
  size?: 'small' | 'medium' | 'large';
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled,
  textStyle,
  buttonStyle,
  fullWidth = false,
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
    if (disabled) {
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
    if (disabled) {
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

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || variant === 'disabled'}
      style={[getButtonStyles(), buttonStyle]}
    >
      <Text style={[getTextStyles(), textStyle]}>{title}</Text>
    </TouchableOpacity>
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

export default Button;
