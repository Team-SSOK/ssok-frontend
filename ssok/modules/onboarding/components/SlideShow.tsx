import React, { useRef, useEffect } from 'react';
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
import Pagination from './Pagination';
import useOnboarding from '../hooks/useOnboarding';

const { width } = Dimensions.get('window');

type ViewableItemsChangedInfo = {
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
  const { currentSlide, goToSlide, goToNextSlide } = useOnboarding();

  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = currentSlide === data.length - 1;

  // 스크롤 시 현재 인덱스 업데이트
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentSlide) {
      goToSlide(index);
    }
  };

  // 화면에 보이는 아이템 변경 시 처리
  const handleViewableItemsChanged = useRef(
    (info: ViewableItemsChangedInfo) => {
      const { viewableItems } = info;
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        goToSlide(viewableItems[0].index);
      }
      if (onViewableItemsChanged) {
        onViewableItemsChanged(info);
      }
    },
  ).current;

  // 페이지 변경 핸들러
  const handlePageChange = (index: number) => {
    goToSlide(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // 자동 재생 기능
  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | undefined;

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
  }, [autoPlay, currentSlide, data.length, loop, autoPlayInterval]);

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
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>{item}</View>
        )}
        keyExtractor={(_, index) => index.toString()}
        onScroll={handleScroll}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.footerContainer}>
        {showPagination &&
          (PaginationComponent || (
            <Pagination
              total={data.length}
              current={currentSlide}
              onPageChange={handlePageChange}
            />
          ))}

        {showSkip && !isLastSlide && SkipComponent}
        {isLastSlide && EndComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slide: {
    flex: 1,
  },
  footerContainer: {
    paddingBottom: 40,
  },
});

export default SlideShow;
