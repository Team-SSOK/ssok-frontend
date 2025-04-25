import React, { useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';
import NextButton from '../../modules/transfer/components/NextButton';

export default function CompleteScreen() {
  const { amount } = useLocalSearchParams();
  const formattedAmount = parseInt(amount as string, 10).toLocaleString(
    'ko-KR',
  );

  // 3초 후 자동으로 홈으로 이동하는 타이머 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      // 자동으로 홈으로 이동
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('@/assets/lottie/success.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
        </View>

        <Text style={styles.title}>송금 완료</Text>
        <Text style={styles.amountText}>{formattedAmount}원</Text>
        <Text style={styles.message}>송금이 성공적으로 완료되었습니다.</Text>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <NextButton onPress={handleGoHome} enabled={true} title="홈으로" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  spacer: {
    flex: 1,
    minHeight: 100,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 24,
  },
});
