import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import LottieView from 'lottie-react-native';
import Button from '@/components/Button';
import { usePin } from '@/contexts/PinContext';
import { useEffect, useState } from 'react';
import AuthStorage from '@/services/AuthStorage';

export default function Index() {
  const { isLoggedIn, isLoading } = usePin();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // 등록 상태 확인
  useEffect(() => {
    const checkStatus = async () => {
      const registrationStatus = await AuthStorage.isUserRegistered();
      setIsRegistered(registrationStatus);
      setCheckingStatus(false);
    };

    checkStatus();
  }, []);

  const handleStart = () => {
    router.push('/auth/register');
  };

  const handleLogin = () => {
    router.push('/auth/pin-login');
  };

  // 이미 로그인되어 있다면 홈 탭으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      // 탭 화면으로 이동
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  // 로딩 상태 표시
  if (isLoading || checkingStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.titleWrapper}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SSOK 쏙</Text>
          <Text style={styles.subtitle}>터치 한 번으로 완성되는</Text>
          <Text style={styles.subtitle}>나만의 간편 송금 앱</Text>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('@/assets/lottie/welcome.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>

        {isRegistered ? (
          <Button
            title="SSOK 로그인하기"
            variant="primary"
            size="large"
            onPress={handleLogin}
            testID="login-button"
            buttonStyle={styles.startButton}
            fullWidth
          />
        ) : (
          <Button
            title="SSOK 시작하기"
            variant="primary"
            size="large"
            onPress={handleStart}
            testID="start-button"
            buttonStyle={styles.startButton}
            fullWidth
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  titleWrapper: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    marginTop: -20,
  },
  titleContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 100,
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
    marginVertical: 10,
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  startButton: {
    marginTop: 20,
  },
});
