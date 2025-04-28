import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePin } from '@/contexts/PinContext';
import AuthStorage from '@/services/AuthStorage';
import SlideShow from '@/modules/onboarding/components/SlideShow';
import { onboardingSlides } from '@/modules/onboarding/data';

type ViewableItemsChangedInfo = {
  viewableItems: ViewToken[];
  changed: ViewToken[];
};

export default function Index() {
  const { isLoggedIn, isLoading } = usePin();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // 등록 상태 확인
  useEffect(() => {
    const checkStatus = async () => {
      const registrationStatus = await AuthStorage.isUserRegistered();
      setIsRegistered(registrationStatus);
      setCheckingStatus(false);

      // 등록된 사용자는 PIN 로그인 화면으로 바로 이동
      // if (registrationStatus && !isLoggedIn) {
      //   router.push('/auth/pin-login');
      // }
    };

    checkStatus();
  }, [isLoggedIn]);

  const handleStart = () => {
    router.push('/auth/register');
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  // 로딩 상태 표시
  if (isLoading || checkingStatus) {
    return (
      <SafeAreaView style={styles.loadingWrapper}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSlideChange = (info: ViewableItemsChangedInfo) => {
    const { viewableItems } = info;
    if (
      viewableItems &&
      viewableItems.length > 0 &&
      viewableItems[0].index !== null
    ) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  };

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
                <Text style={styles.startButtonText}>SSOK 시작하기</Text>
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
  loadingWrapper: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});
