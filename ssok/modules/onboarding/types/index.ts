import { ImageSourcePropType } from 'react-native';
import { SharedValue, AnimatedRef } from 'react-native-reanimated';

/**
 * 슬라이드 미디어 타입
 */
export type MediaType = 'image' | 'video' | 'lottie';

/**
 * 슬라이드 데이터 인터페이스
 */
export interface SlideData {
  key: string;
  title: string;
  subtitle1: string;
  subtitle2: string;
  mediaType: MediaType;
  source: ImageSourcePropType;
}

/**
 * 온보딩 아이템 컴포넌트 Props
 */
export interface OnboardingItemProps {
  item: SlideData;
  index: number;
  x: SharedValue<number>;
}

/**
 * 페이지네이션 컴포넌트 Props
 */
export interface PaginationDotsProps {
  length: number;
  x: SharedValue<number>;
}

/**
 * 온보딩 버튼 컴포넌트 Props
 */
export interface OnboardingButtonProps {
  currentIndex: SharedValue<number>;
  length: number;
  onComplete: () => void;
  onNext: () => void;
}

/**
 * 온보딩 훅 반환 타입
 */
export interface UseOnboardingReturn {
  x: SharedValue<number>;
  currentIndex: SharedValue<number>;
  scrollHandler: any;
  onViewableItemsChanged: (info: { viewableItems: any[] }) => void;
  handleNext: () => void;
  handleComplete: () => void;
  flatListRef: AnimatedRef<any>;
}

export * from './index';
