import { StyleSheet, TextStyle } from 'react-native';
import { fontFamily } from '@/utils/loadFonts';

/**
 * 앱 전체 텍스트 스타일 시스템
 *
 * 일관된 텍스트 스타일링을 위한 타이포그래피 프리셋 모음입니다.
 * Text 컴포넌트의 preset 속성으로 사용할 수 있습니다.
 *
 * @example
 * ```tsx
 * <Text preset="h1">제목</Text>
 * <Text preset="body1">본문 텍스트입니다.</Text>
 * ```
 */

// 테마별 타이포그래피 옵션 정의
const typographyOptions = {
  // 헤딩
  heading: {
    h1: {
      fontFamily: fontFamily.extraBold,
      fontSize: 28,
      lineHeight: 34,
    } as TextStyle,

    h2: {
      fontFamily: fontFamily.extraBold,
      fontSize: 24,
      lineHeight: 30,
    } as TextStyle,

    h3: {
      fontFamily: fontFamily.bold,
      fontSize: 20,
      lineHeight: 26,
    } as TextStyle,

    highlight: {
      fontFamily: fontFamily.extraBold,
      fontSize: 18,
      lineHeight: 24,
    } as TextStyle,
  },

  // 본문
  body: {
    body1: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
    } as TextStyle,

    body2: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
    } as TextStyle,

    light: {
      fontFamily: fontFamily.light,
      fontSize: 14,
      lineHeight: 20,
    } as TextStyle,
  },

  // UI 요소
  ui: {
    label: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 18,
    } as TextStyle,

    button: {
      fontFamily: fontFamily.bold,
      fontSize: 16,
      lineHeight: 24,
    } as TextStyle,

    caption: {
      fontFamily: fontFamily.smallRegular,
      fontSize: 12,
      lineHeight: 16,
    } as TextStyle,

    captionBold: {
      fontFamily: fontFamily.smallBold,
      fontSize: 12,
      lineHeight: 16,
    } as TextStyle,
  },
};

// 모든 타이포그래피 스타일을 단일 객체로 결합
export const typography = StyleSheet.create({
  // 헤딩 스타일
  ...typographyOptions.heading,

  // 본문 스타일
  ...typographyOptions.body,

  // UI 요소 스타일
  ...typographyOptions.ui,
});

// 필요시 개별 카테고리 익스포트
export const heading = StyleSheet.create(typographyOptions.heading);
export const body = StyleSheet.create(typographyOptions.body);
export const ui = StyleSheet.create(typographyOptions.ui);

export default typography;
