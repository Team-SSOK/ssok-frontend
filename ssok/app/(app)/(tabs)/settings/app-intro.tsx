import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';
// import SlideShow from '@/modules/onboarding/components/SlideShow';
// import { onboardingSlides } from '@/modules/onboarding/utils/slides';
import { Header } from '@/modules/settings';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';
import { Ionicons } from '@expo/vector-icons';

export default function AppIntroScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 */}
      <Header title="앱 소개" showBackButton={true} />

      {/* 슬라이드쇼 */}
      <View style={styles.slideContainer}>
        {/* <SlideShow
          data={onboardingSlides}
          showPagination={true}
          EndComponent={
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={[typography.button, styles.closeButtonText]}>
                  닫기
                </Text>
              </TouchableOpacity>
            </View>
          } */}
        {/* /> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slideContainer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    marginTop: 20,
  },
  closeButton: {
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
  closeButtonText: {
    color: colors.white,
  },
});
