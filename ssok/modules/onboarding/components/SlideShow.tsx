import React, { useRef, useState } from 'react';
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
  onViewableItemsChanged,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = currentIndex === data.length - 1;

  // 스크롤 시 현재 인덱스 업데이트
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // 화면에 보이는 아이템 변경 시 처리
  const handleViewableItemsChanged = useRef(
    (info: ViewableItemsChangedInfo) => {
      const { viewableItems } = info;
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
      if (onViewableItemsChanged) {
        onViewableItemsChanged(info);
      }
    },
  ).current;

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
            <Pagination totalSlides={data.length} currentIndex={currentIndex} />
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
