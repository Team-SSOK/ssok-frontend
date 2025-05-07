import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

type LoadingProps = {
  visible: boolean;
  style?: ViewStyle;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
};

/**
 * 간단한 로딩 컴포넌트
 * Lottie 애니메이션만 표시합니다.
 */
const Loading: React.FC<LoadingProps> = ({
  visible,
  style,
  loop = true,
  autoPlay = true,
  speed = 1,
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={require('@/assets/lottie/loading.json')}
        style={styles.lottieView}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  lottieView: {
    width: 80,
    height: 80,
  },
});

export default Loading;
