import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    KakaoBigSansRegular: require('@/assets/fonts/KakaoBigSans-Regular.ttf'),
    KakaoBigSansBold: require('@/assets/fonts/KakaoBigSans-Bold.ttf'),
    KakaoBigSansExtraBold: require('@/assets/fonts/KakaoBigSans-ExtraBold.ttf'),
    KakaoSmallSansLight: require('@/assets/fonts/KakaoSmallSans-Light.ttf'),
    KakaoSmallSansRegular: require('@/assets/fonts/KakaoSmallSans-Regular.ttf'),
    KakaoSmallSansBold: require('@/assets/fonts/KakaoSmallSans-Bold.ttf'),
  });
};

export const fontFamily = {
  regular: 'KakaoBigSansRegular',
  bold: 'KakaoBigSansBold',
  extraBold: 'KakaoBigSansExtraBold',
  light: 'KakaoSmallSansLight',
  smallRegular: 'KakaoSmallSansRegular',
  smallBold: 'KakaoSmallSansBold',
};

export default loadFonts;
