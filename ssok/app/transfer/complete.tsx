import React, { useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import NextButton from '../../modules/transfer/components/NextButton';
import AnimatedLayout from '../../modules/transfer/components/AnimatedLayout';
import CompleteMessage from '../../modules/transfer/components/CompleteMessage';

/**
 * 송금 완료 화면
 * 송금이 성공적으로 완료되었음을 사용자에게 알리는 화면
 */
export default function CompleteScreen() {
  const { amount } = useLocalSearchParams();

  const handleGoHome = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <AnimatedLayout style={styles.content} duration={500}>
        {/* 송금 완료 메시지와 애니메이션 */}
        <CompleteMessage amount={Number(amount)} />

        <View style={styles.spacer} />

        {/* 홈으로 돌아가기 버튼 */}
        <View style={styles.buttonContainer}>
          <NextButton onPress={handleGoHome} enabled={true} title="홈으로" />
        </View>
      </AnimatedLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
