import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import LottieView from 'lottie-react-native';
import Button from '@/components/Button';

export default function Index() {
  const handleStart = () => {
    router.push('/register');
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SSOK 쏙</Text>
          <Text style={styles.subtitle}>터치 한 번으로 완성되는</Text>
          <Text style={styles.subtitle}>나만의 간편 송금 앱</Text>
        </View>

        <View style={styles.lottieContainer}>
          <LottieView
            source={require('@/assets/lottie/welcome.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>

        <Button
          title="SSOK 시작하기"
          variant="secondary"
          size="large"
          onPress={handleStart}
          testID="start-button"
          buttonStyle={styles.startButton}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '200',
    color: colors.white,
    lineHeight: 30,
  },
  lottieContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  startButton: {
    marginTop: 20,
  },
});
