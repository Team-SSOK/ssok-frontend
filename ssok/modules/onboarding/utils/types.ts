import { ReactNode } from 'react';
import { ImageSourcePropType, ViewStyle, TextStyle } from 'react-native';
import { VideoSource } from 'expo-video';

/**
 * 슬라이드에 사용될 미디어 타입
 */
export type SlideMediaType = 'image' | 'video' | 'lottie' | 'component';

/**
 * 슬라이드 데이터 인터페이스
 */
export interface SlideData {
  key: string;
  title: string;
  subtitle1: string;
  subtitle2?: string;
  mediaType: SlideMediaType;
  source?: ImageSourcePropType | VideoSource | any; // any는 Lottie source 타입
  component?: ReactNode;
}

/**
 * 슬라이드 스타일 인터페이스
 */
export interface SlideStyles {
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  imageContainerStyle?: ViewStyle;
}

/**
 * 온보딩 카드 데이터 인터페이스
 */
export interface OnboardingCardData {
  title: string;
  description: string;
  iconName?: string;
  iconColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
}

/**
 * 페이지네이션 컴포넌트 Props
 */
export interface PaginationProps {
  total: number;
  current: number;
  onPageChange?: (index: number) => void;
}
