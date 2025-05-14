import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface SlideProps {
  title: string;
  subtitle1: string;
  subtitle2?: string;
  imageSource?: ImageSourcePropType;
  videoSource?: VideoSource;
  lottieSource?: any; // Lottie source type
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  imageContainerStyle?: ViewStyle;
  isCard?: boolean;
  cardContent?: React.ReactNode;
}

const Slide: React.FC<SlideProps> = ({
  title,
  subtitle1,
  subtitle2,
  imageSource,
  videoSource,
  lottieSource,
  containerStyle,
  titleStyle,
  subtitleStyle,
  imageContainerStyle,
  isCard = false,
  cardContent,
}) => {
  // 비디오 소스가 제공된 경우 비디오 플레이어 초기화
  const player = videoSource
    ? useVideoPlayer(videoSource, (player) => {
        player.loop = true;
        player.play();
      })
    : null;

  // 컨텐츠 렌더링
  const renderContent = () => {
    if (isCard && cardContent) {
      return cardContent;
    } else if (imageSource) {
      return (
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      );
    } else if (videoSource && player) {
      return (
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
        />
      );
    } else if (lottieSource) {
      return (
        <LottieView source={lottieSource} style={styles.lottie} autoPlay loop />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={[typography.h1, styles.title, titleStyle]}>{title}</Text>

        <View style={styles.subtitleContainer}>
          <Text style={[typography.body1, styles.subtitle, subtitleStyle]}>
            {subtitle1}
          </Text>
          {subtitle2 && (
            <Text style={[typography.body1, styles.subtitle, subtitleStyle]}>
              {subtitle2}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.imageContainer, imageContainerStyle]}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    height: '70%',
  },
  video: {
    width: '100%',
    height: '70%',
  },
  lottie: {
    width: '50%',
    height: '50%',
  },
});

export default Slide;
