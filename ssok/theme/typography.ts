import { StyleSheet } from 'react-native';
import { fontFamily } from '@/utils/loadFonts';

// 전역 텍스트 스타일
export const typography = StyleSheet.create({
  // 헤더 텍스트
  h1: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: fontFamily.extraBold,
    fontSize: 24,
    lineHeight: 30,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
  },

  // 본문 텍스트
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  // 레이블, 버튼 등
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 18,
  },
  button: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
  },

  // 작은 텍스트
  caption: {
    fontFamily: fontFamily.smallRegular,
    fontSize: 12,
    lineHeight: 16,
  },

  // 추가 스타일
  captionBold: {
    fontFamily: fontFamily.smallBold,
    fontSize: 12,
    lineHeight: 16,
  },

  light: {
    fontFamily: fontFamily.light,
    fontSize: 14,
    lineHeight: 20,
  },

  highlight: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    lineHeight: 24,
  },
});

export default typography;
