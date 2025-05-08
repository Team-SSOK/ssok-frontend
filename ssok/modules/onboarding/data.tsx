import React from 'react';
import { StyleSheet } from 'react-native';
import Slide from './components/Slide';
import { colors } from '@/constants/colors';

// Styles for slides
const styles = StyleSheet.create({
  slideContainer: {
    backgroundColor: colors.white,
    padding: 20,
  },
  slideTitle: {
    color: colors.black,
    textAlign: 'center',
  },
  slideSubtitle: {
    color: colors.grey,
    textAlign: 'center',
  },
  slideImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
});

// Slide content and configuration
export const onboardingSlides = [
  // Slide 1: Account management
  <Slide
    key="slide1"
    title="모든 계좌를 한눈에 관리하세요"
    subtitle1="원하는 결제 수단을"
    subtitle2="자유롭게 선택해 사용할 수 있어요."
    containerStyle={styles.slideContainer}
    titleStyle={styles.slideTitle}
    subtitleStyle={styles.slideSubtitle}
    imageContainerStyle={styles.slideImageContainer}
    imageSource={require('@/assets/images/slide1.jpg')}
  />,

  // Slide 2: Fast money transfer
  <Slide
    key="slide2"
    title="지금, 빠른 송금을 경험하세요"
    subtitle1="단순한 송금을 넘어,"
    subtitle2="더 빠르고 간편한 송금 프로세스"
    containerStyle={styles.slideContainer}
    titleStyle={styles.slideTitle}
    subtitleStyle={styles.slideSubtitle}
    imageContainerStyle={styles.slideImageContainer}
    videoSource={require('@/assets/videos/slide2.mp4')}
  />,

  // Slide 3: Bluetooth transfer feature
  <Slide
    key="slide3"
    title="SSOK만의 특별한 블루투스 송금"
    subtitle1="블루투스 송금으로"
    subtitle2="주변 사람에게 빠르게 송금해보세요"
    containerStyle={styles.slideContainer}
    titleStyle={styles.slideTitle}
    subtitleStyle={styles.slideSubtitle}
    imageContainerStyle={styles.slideImageContainer}
    lottieSource={require('@/assets/lottie/slide3.json')}
  />,

  // Slide 4: Final call to action
  <Slide
    key="slide4"
    title="지금 SSOK과 함께 시작하세요"
    subtitle1="간편 송금의 모든 경험을"
    subtitle2="지금 바로 만나보세요"
    containerStyle={styles.slideContainer}
    titleStyle={styles.slideTitle}
    subtitleStyle={styles.slideSubtitle}
    imageContainerStyle={styles.slideImageContainer}
    lottieSource={require('@/assets/lottie/slide4.json')}
  />,
];
