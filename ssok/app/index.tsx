import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@/constants/colors';
import SlideShow, {
  ViewableItemsChangedInfo,
} from '@/modules/onboarding/components/SlideShow';
import { onboardingSlides } from '@/modules/onboarding/utils/slides';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { useLoadingStore } from '@/stores/loadingStore';

const StartButton = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity
      style={styles.startButton}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="SSOK 시작하기"
      accessibilityHint="앱 온보딩을 완료하고 회원가입 화면으로 이동합니다"
    >
      <Text style={[typography.button, styles.startButtonText]}>
        SSOK 시작하기
      </Text>
    </TouchableOpacity>
  </View>
);

export default function Index() {
  const { checkingStatus } = useAuthFlow();
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const { startLoading, stopLoading } = useLoadingStore();

  // 인증 상태 확인 중일 때 전역 로딩 상태 사용
  useEffect(() => {
    if (checkingStatus) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [checkingStatus, startLoading, stopLoading]);

  const handleStart = () => {
    return <Link href="/auth/register" />;
  };

  // 슬라이드 변경 이벤트 핸들러
  const handleSlideChange = useCallback((info: ViewableItemsChangedInfo) => {
    const { viewableItems } = info;
    if (viewableItems?.length > 0 && viewableItems[0].index !== null) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }, []);

  // 로딩 중일 때는 빈 화면 표시
  if (checkingStatus) {
    return null;
  }

  // 마지막 슬라이드에서만 시작하기 버튼 표시
  const isLastSlide = currentSlideIndex === onboardingSlides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea}>
        <SlideShow
          data={onboardingSlides}
          showPagination={!isLastSlide}
          EndComponent={
            isLastSlide ? <StartButton onPress={handleStart} /> : undefined
          }
          onViewableItemsChanged={handleSlideChange}
          autoPlay={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    marginTop: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  startButtonText: {
    color: colors.white,
  },
});
