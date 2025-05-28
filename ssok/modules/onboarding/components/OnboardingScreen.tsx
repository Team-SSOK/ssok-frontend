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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 슬라이드 FlatList */}
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

      {/* 하단 컨트롤 영역 */}
      <View style={styles.bottomContainer}>
        {/* 페이지네이션 도트 */}

        {/* 네비게이션 버튼 */}
        <View style={styles.buttonContainer}>
          <PaginationDots length={slideData.length} x={x} />
          <OnboardingButton
            currentIndex={currentIndex}
            length={slideData.length}
            onComplete={handleOnboardingComplete}
            onNext={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flatList: {
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
