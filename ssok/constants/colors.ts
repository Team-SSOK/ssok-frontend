/**
 * 앱 전체에서 사용하는 색상 정의
 * 목적 기반으로 그룹화하여 일관된 색상 사용 보장
 */

// 기본 파레트 정의
const palette = {
  // 브랜드 색상
  blue: {
    main: '#3386FF',
    dark: '#2C5CED',
    darker: '#2A52CC',
    darkest: '#18287A',
    light: '#5D7BFF',
    lighter: '#80ABFF',
    lightest: '#B3CCFF',
    background: '#EDF7FF',
  },

  // 중립 색상
  neutral: {
    black: '#263238',
    darkGrey: '#4D4D4D',
    grey: '#717171',
    lightGrey: '#8F98AE',
    greyBlue: '#A8BED1',
    silver: '#EBEDF3',
    white: '#FFFFFF',
  },

  // 상태 색상
  state: {
    success: '#4CD964',
    warning: '#FF9500',
    error: '#FF3B30',
    inactive: '#8E8E93',
  },

  // UI 색상
  ui: {
    background: 'rgb(250,250,250)',
    card: '#F9F9F9',
    border: '#E1E1E1',
    next: '#E6E6E6',
  },
};

// 테마 정의
export const colors = {
  // 기능 기반 접근 (목적에 따른 색상 사용)
  primary: palette.blue.main,
  hover: palette.blue.dark,
  disabled: palette.blue.background,

  // 텍스트 색상
  text: {
    primary: palette.neutral.black,
    secondary: palette.neutral.darkGrey,
    tertiary: palette.neutral.grey,
    hint: palette.neutral.lightGrey,
    disabled: palette.neutral.greyBlue,
    inverse: palette.neutral.white,
  },

  // 배경 색상
  background: palette.ui.background,
  card: palette.ui.card,

  // 테두리 색상
  border: palette.ui.border,
  divider: palette.neutral.silver,

  // 상태 색상
  success: palette.state.success,
  warning: palette.state.warning,
  error: palette.state.error,
  inactive: palette.state.inactive,
  notification: palette.state.error,

  // UI 색상
  next: palette.ui.next,

  // 원래 코드와의 호환성을 위한 색상 (기존 이름 유지)
  black: palette.neutral.black,
  mGrey: palette.neutral.darkGrey,
  grey: palette.neutral.grey,
  lGrey: palette.neutral.lightGrey,
  greyBlue: palette.neutral.greyBlue,
  silver: palette.neutral.silver,
  white: palette.neutral.white,

  shade1: palette.blue.darker,
  shade2: palette.blue.darkest,
  shade3: palette.blue.darkest,

  tint1: palette.blue.light,
  tint2: palette.blue.lighter,
  tint3: palette.blue.lightest,
};

export default colors;
