import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { fontFamily, loadFonts } from '@/utils/loadFonts';
import { typography } from '@/theme/typography';

// =============================================
// Text 컴포넌트
// =============================================

// 기본 폰트 스타일
const defaultFontStyle: TextStyle = {
  fontFamily: fontFamily.regular,
};

interface CustomTextProps extends TextProps {
  preset?: keyof typeof typography;
  color?: string;
}

/**
 * 확장된 텍스트 컴포넌트
 * - 기본 폰트 사용
 * - 타이포그래피 프리셋 적용 가능
 * - 색상 직접 지정 가능
 */
export const Text: React.FC<CustomTextProps> = ({
  style,
  preset,
  color,
  ...props
}) => {
  // 프리셋과 색상, 스타일을 조합
  const combinedStyle = [
    defaultFontStyle,
    preset && typography[preset],
    color && { color },
    style,
  ];

  return <RNText {...props} style={combinedStyle} />;
};

// =============================================
// 폰트 로딩 Context
// =============================================

interface FontContextType {
  fontsLoaded: boolean;
}

const FontContext = createContext<FontContextType>({
  fontsLoaded: false,
});

/**
 * 폰트 로딩 상태 Hook
 */
export const useFonts = () => useContext(FontContext);

/**
 * 폰트 로딩과 제공을 담당하는 Provider 컴포넌트
 */
export const FontProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // 앱이 시작될 때 폰트 로드
    const loadAppFonts = async () => {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to load fonts', error);
        // 폰트 로드 실패해도 앱은 계속 진행
        setFontsLoaded(true);
      }
    };

    loadAppFonts();
  }, []);

  return (
    <FontContext.Provider value={{ fontsLoaded }}>
      {children}
    </FontContext.Provider>
  );
};

/**
 * 이전 버전과의 호환성을 위해 TextProvider 유지
 * @deprecated FontProvider를 대신 사용하세요
 */
export const TextProvider = FontProvider;

export default FontProvider;
