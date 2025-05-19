import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
  ImageStyle,
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
  isLast?: boolean;
  isCard?: boolean;
  cardContent?: React.ReactNode;
}

// 미디어 카드 기본 스타일
const mediaCard: ViewStyle & ImageStyle = {
  height: 420,
  width: 220,
  borderRadius: 10,

  // iOS 그림자
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 3,

  // Android 그림자
  elevation: 4,
};

// 이미지 미디어 컴포넌트
const ImageMedia = React.memo(({ source }: { source: ImageSourcePropType }) => (
  <Image source={source} style={styles.image} resizeMode="contain" />
));

// 비디오 미디어 컴포넌트
const VideoMedia = React.memo(
  ({ source, isLast }: { source: VideoSource; isLast?: boolean }) => {
    const player = useVideoPlayer(source, (player) => {
      player.loop = true;
      player.play();
    });

    if (!player) return null;

    return (
      <VideoView
        player={player}
        style={isLast ? styles.lastVideo : styles.video}
        nativeControls={false}
        pointerEvents="none"
      />
    );
  },
);

// Lottie 미디어 컴포넌트
const LottieMedia = React.memo(({ source }: { source: any }) => (
  <LottieView source={source} style={styles.lottie} autoPlay loop />
));

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
  isLast = false,
  cardContent,
}) => {
  // 미디어 컨텐츠 메모이제이션
  const mediaContent = useMemo(() => {
    if (isCard && cardContent) {
      return cardContent;
    } else if (imageSource) {
      return <ImageMedia source={imageSource} />;
    } else if (videoSource) {
      return <VideoMedia source={videoSource} isLast={isLast} />;
    } else if (lottieSource) {
      return <LottieMedia source={lottieSource} />;
    }
    return null;
  }, [isCard, cardContent, imageSource, videoSource, lottieSource, isLast]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={[typography.h1, styles.title, titleStyle]}>{title}</Text>

        <View style={styles.subtitleContainer}>
          <Text style={[typography.h3, styles.subtitle, subtitleStyle]}>
            {subtitle1}
          </Text>
          {subtitle2 && (
            <Text style={[typography.h3, styles.subtitle, subtitleStyle]}>
              {subtitle2}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.imageContainer, imageContainerStyle]}>
        {mediaContent}
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
    position: 'relative',
  },
  image: {
    ...mediaCard,
  },
  video: {
    ...mediaCard,
  },
  lastVideo: {
    width: '100%',
    height: '70%',
  },
  lottie: {
    width: '50%',
    height: '50%',
  },
});

export default React.memo(Slide);
