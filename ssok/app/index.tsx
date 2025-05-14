import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import SlideShow from '@/modules/onboarding/components/SlideShow';
import { onboardingSlides } from '@/modules/onboarding/slides';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoadingStore } from '@/stores/loadingStore';

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
  changed: ViewToken[];
};

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
    router.push('/auth/register');
  };

  const handleSlideChange = (info: ViewableItemsChangedInfo) => {
    const { viewableItems } = info;
    if (viewableItems?.length > 0 && viewableItems[0].index !== null) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  };

  if (checkingStatus) {
    return null; // 전역 로딩 인디케이터가 표시되므로 아무것도 렌더링하지 않음
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea}>
        <SlideShow
          data={onboardingSlides}
          showPagination={currentSlideIndex < onboardingSlides.length - 1}
          EndComponent={
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={[typography.button, styles.startButtonText]}>
                  SSOK 시작하기
                </Text>
              </TouchableOpacity>
            </View>
          }
          onViewableItemsChanged={handleSlideChange}
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
