import React from 'react';
import Slide from './components/Slide';
import { colors } from '@/constants/colors';
import { SlideData, SlideStyles } from './utils/types';

/**
 * 슬라이드 스타일 정의
 */
export const slideStyles: SlideStyles = {
  containerStyle: {
    backgroundColor: colors.white,
    padding: 20,
  },
  titleStyle: {
    color: colors.black,
    textAlign: 'center',
  },
  subtitleStyle: {
    color: colors.grey,
    textAlign: 'center',
  },
  imageContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
};

/**
 * 슬라이드 데이터 정의
 */
export const slideData: SlideData[] = [
  {
    key: 'slide1',
    title: '모든 계좌를 한눈에 관리하세요',
    subtitle1: '원하는 결제 수단을',
    subtitle2: '자유롭게 선택해 사용할 수 있어요.',
    mediaType: 'image',
    source: require('@/modules/onboarding/assets/slide1.jpg'),
  },
  {
    key: 'slide2',
    title: '더 빠른 송금을 경험하세요',
    subtitle1: '단순한 송금을 넘어,',
    subtitle2: '더 빠르고 간편한 송금 프로세스',
    mediaType: 'video',
    source: require('@/modules/onboarding/assets/slide2.mp4'),
  },
  {
    key: 'slide3',
    title: `SSOK만의 블루투스 송금`,
    subtitle1: '블루투스 송금으로',
    subtitle2: '주변 사람에게 빠르게 송금해보세요',
    mediaType: 'lottie',
    source: require('@/modules/onboarding/assets/slide3.json'),
  },
  {
    key: 'slide4',
    title: '지금 SSOK과 함께 시작하세요',
    subtitle1: '간편 송금의 모든 경험을',
    subtitle2: '지금 바로 만나보세요',
    mediaType: 'video',
    source: require('@/modules/onboarding/assets/slide4.mp4'),
  },
];

/**
 * 슬라이드 컴포넌트 렌더링 함수
 */
export const renderSlides = () => {
  return slideData.map((slide, index) => {
    // key를 제외한 기본 props 정의
    const commonProps = {
      title: slide.title,
      subtitle1: slide.subtitle1,
      subtitle2: slide.subtitle2,
      containerStyle: slideStyles.containerStyle,
      titleStyle: slideStyles.titleStyle,
      subtitleStyle: slideStyles.subtitleStyle,
      imageContainerStyle: slideStyles.imageContainerStyle,
      isLast: index === slideData.length - 1, // 마지막 슬라이드 여부
    };

    // 미디어 타입에 따라 props 추가하고 key는 직접 전달
    switch (slide.mediaType) {
      case 'image':
        return (
          <Slide key={slide.key} {...commonProps} imageSource={slide.source} />
        );
      case 'video':
        return (
          <Slide key={slide.key} {...commonProps} videoSource={slide.source} />
        );
      case 'lottie':
        return (
          <Slide key={slide.key} {...commonProps} lottieSource={slide.source} />
        );
      case 'component':
        return (
          <Slide
            key={slide.key}
            {...commonProps}
            isCard={true}
            cardContent={slide.component}
          />
        );
      default:
        return null;
    }
  });
};

// 미리 렌더링된 슬라이드 배열
export const onboardingSlides = renderSlides();
