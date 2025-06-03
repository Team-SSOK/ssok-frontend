import { LayoutAnimation, Platform } from 'react-native';

/**
 * 스텝 전환 애니메이션 설정
 */
export const createStepTransition = () => {
  if (Platform.OS === 'ios') {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  } else {
    // Android에서는 더 부드러운 애니메이션 사용
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
};

/**
 * 텍스트 페이드 인/아웃 애니메이션
 */
export const createTextFadeTransition = () => {
  LayoutAnimation.configureNext({
    duration: 250,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
};

/**
 * 슬라이드 애니메이션 (좌우 이동)
 */
export const createSlideTransition = (
  direction: 'left' | 'right' = 'right',
) => {
  LayoutAnimation.configureNext({
    duration: 350,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.scaleXY,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.scaleXY,
    },
  });
};
