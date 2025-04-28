import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';

interface SlideProps {
  title: string;
  subtitle1: string;
  subtitle2?: string;
  imageSource?: ImageSourcePropType;
  videoSource?: any; // Changed from string to any to handle require()
  lottieSource?: any;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  imageContainerStyle?: ViewStyle;
  isCard?: boolean; // Flag to determine if the slide content is a card (like KB Pay Money)
  cardContent?: React.ReactNode; // Custom card content
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
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>

        <View style={styles.subtitleContainer}>
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle1}</Text>
          {subtitle2 && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle2}</Text>
          )}
        </View>
      </View>

      <View style={[styles.imageContainer, imageContainerStyle]}>
        {isCard && cardContent ? (
          cardContent
        ) : imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        ) : videoSource ? (
          <VideoView player={player} style={styles.video} />
        ) : lottieSource ? (
          <LottieView
            source={lottieSource}
            style={styles.lottie}
            autoPlay
            loop
          />
        ) : null}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
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
