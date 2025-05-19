import { ReactNode } from 'react';
import { ImageSourcePropType, ViewStyle, TextStyle } from 'react-native';
import { VideoSource } from 'expo-video';

/**
 * 슬라이드에 사용될 미디어 타입 정의
 */
export type SlideMediaType = 'image' | 'video' | 'lottie' | 'component';

/**
 * 슬라이드 데이터 인터페이스
 * @property key - 슬라이드의 고유 식별자
 * @property title - 슬라이드 제목
 * @property subtitle1 - 슬라이드 부제목 첫 줄
 * @property subtitle2 - 슬라이드 부제목 두 번째 줄 (선택)
 * @property mediaType - 슬라이드에 표시할 미디어 타입
 * @property source - 미디어의 소스 (이미지, 비디오, Lottie 애니메이션)
 * @property component - 커스텀 컴포넌트를 사용할 경우 해당 ReactNode (선택)
 */
export interface SlideData {
  key: string;
  title: string;
  subtitle1: string;
  subtitle2?: string;
  mediaType: SlideMediaType;
  source?: ImageSourcePropType | VideoSource | any; // Lottie 소스 타입
  component?: ReactNode;
}

/**
 * 슬라이드 스타일 인터페이스
 * @property containerStyle - 슬라이드 컨테이너의 스타일
 * @property titleStyle - 슬라이드 제목의 스타일
 * @property subtitleStyle - 슬라이드 부제목의 스타일
 * @property imageContainerStyle - 이미지 컨테이너의 스타일
 */
export interface SlideStyles {
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  imageContainerStyle?: ViewStyle;
}

/**
 * 온보딩 카드 데이터 인터페이스
 * @property title - 카드 제목
 * @property description - 카드 설명
 * @property iconName - 아이콘 이름 (선택)
 * @property iconColor - 아이콘 색상 (선택)
 * @property backgroundColor - 배경 색상 (선택)
 * @property onPress - 카드 클릭 시 동작할 함수 (선택)
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
 * @property total - 전체 슬라이드 수
 * @property current - 현재 활성화된 슬라이드 인덱스
 * @property onPageChange - 페이지 변경 시 호출될 콜백 함수
 */
export interface PaginationProps {
  total: number;
  current: number;
  onPageChange?: (index: number) => void;
}

/**
 * VideoSource 타입이 없을 경우를 위한 타입 가드 함수
 * @param source - 확인할 소스
 * @returns 소스가 VideoSource 타입인지 여부
 */
export function isVideoSource(source: any): source is VideoSource {
  return source && typeof source === 'object' && 'uri' in source;
}

/**
 * ImageSource 타입인지 확인하는 타입 가드 함수
 * @param source - 확인할 소스
 * @returns 소스가 ImageSourcePropType 타입인지 여부
 */
export function isImageSource(source: any): source is ImageSourcePropType {
  // 로컬 이미지인 경우 (번들된 이미지)
  if (typeof source === 'number') return true;

  // uri를 포함한 객체인 경우 (원격 이미지)
  return source && typeof source === 'object' && 'uri' in source;
}
