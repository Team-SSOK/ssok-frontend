import React, { useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { colors } from '@/constants/colors';
import useOnboarding from '../hooks/useOnboarding';
import SlideItem from './SlideItem';
import SlideFooter from './SlideFooter';

const { width } = Dimensions.get('window');

export type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
  changed: ViewToken[];
};

interface SlideShowProps {
  data: React.ReactNode[];
  showPagination?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  onEndReached?: () => void;
  PaginationComponent?: React.ReactNode;
  SkipComponent?: React.ReactNode;
  EndComponent?: React.ReactNode;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  onViewableItemsChanged?: (info: ViewableItemsChangedInfo) => void;
}

/**
 * 슬라이드쇼 컴포넌트
 * 슬라이드 데이터를 받아 페이지네이션 포함한 슬라이드쇼를 구성
 */
const SlideShow: React.FC<SlideShowProps> = ({
  data,
  showPagination = true,
  showSkip = false,
  onSkip,
  onEndReached,
  PaginationComponent,
  SkipComponent,
  EndComponent,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = false,
  onViewableItemsChanged,
}) => {
  const { currentSlide, goToSlide } = useOnboarding();
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = currentSlide === data.length - 1;

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (index: number) => {
      goToSlide(index);
      flatListRef.current?.scrollToIndex({ index, animated: true });
    },
    [goToSlide],
  );

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / width);
      if (index !== currentSlide) {
        goToSlide(index);
      }
    },
    [currentSlide, goToSlide],
  );

  // 뷰 변경 이벤트 핸들러
  const handleViewableItemsChanged = useCallback(
    (info: ViewableItemsChangedInfo) => {
      const { viewableItems } = info;
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        goToSlide(viewableItems[0].index);
      }
      if (onViewableItemsChanged) {
        onViewableItemsChanged(info);
      }
    },
    [goToSlide, onViewableItemsChanged],
  );

  // 자동 재생 기능
  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout>;

    if (autoPlay && !isLastSlide) {
      intervalId = setTimeout(() => {
        const nextIndex = currentSlide + 1;

        if (nextIndex < data.length) {
          handlePageChange(nextIndex);
        } else if (loop) {
          handlePageChange(0);
        }
      }, autoPlayInterval);
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [
    autoPlay,
    currentSlide,
    data.length,
    loop,
    autoPlayInterval,
    handlePageChange,
  ]);

  // 마지막 슬라이드에 도달했을 때 이벤트 처리
  useEffect(() => {
    if (isLastSlide && onEndReached) {
      onEndReached();
    }
  }, [isLastSlide, onEndReached]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <SlideItem item={item} />}
        keyExtractor={(_, index) => `slide-${index}`}
        onScroll={handleScroll}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      <SlideFooter
        showPagination={showPagination}
        isLastSlide={isLastSlide}
        dataLength={data.length}
        currentSlide={currentSlide}
        onPageChange={handlePageChange}
        PaginationComponent={PaginationComponent}
        EndComponent={EndComponent}
        SkipComponent={SkipComponent}
        showSkip={showSkip}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default React.memo(SlideShow);
