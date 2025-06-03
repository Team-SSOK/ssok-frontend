import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
} from 'react-native-reanimated';
import { ViewToken } from 'react-native';
import { UseOnboardingReturn } from '../types';

/**
 * 온보딩 화면의 스크롤, 페이지네이션, 네비게이션 로직을 관리하는 훅
 */
export const useOnboarding = (
  totalSlides: number,
  onComplete: () => void,
): UseOnboardingReturn => {
  // 스크롤 위치를 추적하는 공유 값
  const x = useSharedValue(0);

  // 현재 슬라이드 인덱스를 추적하는 공유 값
  const currentIndex = useSharedValue(0);

  // FlatList 참조
  const flatListRef = useAnimatedRef<any>();

  /**
   * 스크롤 이벤트 핸들러
   * 스크롤 위치를 x 공유 값에 업데이트
   */
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  /**
   * 화면에 보이는 아이템이 변경될 때 호출되는 콜백
   * 현재 인덱스를 업데이트
   */
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        currentIndex.value = viewableItems[0].index ?? 0;
      }
    },
    [],
  );

  /**
   * 다음 슬라이드로 이동
   */
  const handleNext = useCallback(() => {
    const nextIndex = currentIndex.value + 1;
    if (nextIndex < totalSlides) {
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
  }, [totalSlides]);

  /**
   * 온보딩 완료 처리
   */
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return {
    x,
    currentIndex,
    scrollHandler,
    onViewableItemsChanged,
    handleNext,
    handleComplete,
    flatListRef,
  };
};
