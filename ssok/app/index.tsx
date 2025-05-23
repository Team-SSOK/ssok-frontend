import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Pressable,
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
import LoadingIndicator from '@/components/LoadingIndicator';

const StartButton = () => (
  <Link href="/auth/register" asChild>
    <Pressable
      style={styles.startButton}
      android_ripple={{
        color: 'rgba(0,0,0,0.2)',
        borderless: false,
        radius: 300,
      }}
    >
      <Text style={[typography.button, styles.startButtonText]}>
        SSOK 시작하기
      </Text>
    </Pressable>
  </Link>
);

export default function Index() {
  const { isAuthChecking } = useAuthFlow();
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // 슬라이드 변경 이벤트 핸들러
  const handleSlideChange = useCallback((info: ViewableItemsChangedInfo) => {
    const { viewableItems } = info;
    if (viewableItems?.length > 0 && viewableItems[0].index !== null) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }, []);

  if (isAuthChecking) {
    return <LoadingIndicator visible={true} />;
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
          EndComponent={isLastSlide ? <StartButton /> : undefined}
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
    margin: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: colors.white,
  },
});
