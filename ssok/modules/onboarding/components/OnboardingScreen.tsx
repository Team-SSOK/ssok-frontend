import React, { useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { slideData } from '../utils/slides';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingItem } from './OnboardingItem';
import { PaginationDots } from './PaginationDots';
import { OnboardingButton } from './OnboardingButton';
import { SlideData } from '../types';

interface OnboardingScreenProps {
  onComplete: () => void;
}

/**
 * 메인 온보딩 화면 컴포넌트
 * FlatList를 사용하여 슬라이드를 렌더링하고, 페이지네이션과 네비게이션 버튼을 포함
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const {
    x,
    currentIndex,
    scrollHandler,
    onViewableItemsChanged,
    handleNext,
    handleComplete,
    flatListRef,
  } = useOnboarding(slideData.length, onComplete);

  /**
   * FlatList 아이템 렌더링 함수
   */
  const renderItem = useCallback(
    ({ item, index }: { item: SlideData; index: number }) => {
      return <OnboardingItem item={item} index={index} x={x} />;
    },
    [x],
  );

  /**
   * 아이템 키 추출 함수
   */
  const keyExtractor = useCallback((item: SlideData) => item.key, []);

  /**
   * 온보딩 완료 핸들러
   */
  const handleOnboardingComplete = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 슬라이드 FlatList - 풀스크린 */}
      <Animated.FlatList
        ref={flatListRef}
        data={slideData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        style={styles.flatList}
      />

      {/* 페이지네이션 도트 - Absolute 포지셔닝 */}
      <View style={styles.paginationContainer}>
        <PaginationDots length={slideData.length} x={x} />
      </View>

      {/* 네비게이션 버튼 - Absolute 포지셔닝 */}
      <View style={styles.buttonContainer}>
        <OnboardingButton
          currentIndex={currentIndex}
          length={slideData.length}
          onComplete={handleOnboardingComplete}
          onNext={handleNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flatList: {
    flex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 75,
    left: -250,
    right: 0,
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 40,
  },
});
