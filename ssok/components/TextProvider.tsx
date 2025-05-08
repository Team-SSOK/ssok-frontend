import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { fontFamily, loadFonts } from '@/utils/loadFonts';

// 기본 폰트 스타일
const defaultFontStyle: TextStyle = {
  fontFamily: fontFamily.regular,
};

// Text 컴포넌트 확장
export const Text: React.FC<TextProps> = ({ style, ...props }) => {
  return <RNText {...props} style={[defaultFontStyle, style]} />;
};

// Font Context 생성
interface FontContextType {
  fontsLoaded: boolean;
}

const FontContext = createContext<FontContextType>({
  fontsLoaded: false,
});

// Custom Hook
export const useFonts = () => useContext(FontContext);

// Provider 컴포넌트
export const TextProvider: React.FC<{ children: React.ReactNode }> = ({
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

export default TextProvider;
