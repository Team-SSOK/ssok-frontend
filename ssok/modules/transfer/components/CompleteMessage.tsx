import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface CompleteMessageProps {
  amount: number;
  message?: string;
  isBluetoothTransfer?: boolean;
  recipientName?: string;
  accountNumber?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
}

/**
 * 송금 완료 메시지 및 애니메이션을 표시하는 컴포넌트
 * 로딩 중에는 loading.gif, 완료 후에는 success/error 애니메이션 표시
 */
export default function CompleteMessage({
  amount,
  message,
  isBluetoothTransfer = false,
  recipientName,
  accountNumber,
  isLoading = false,
  isSuccess = true,
}: CompleteMessageProps) {
  const [showResult, setShowResult] = useState(false);

  // 로딩이 완료되면 결과 애니메이션 표시
  useEffect(() => {
    if (!isLoading) {
      // 약간의 딜레이 후 결과 애니메이션 표시
      setShowResult(true);
      return;
    }
  }, [isLoading]);

  // GIF 로딩 디버깅
  const handleImageLoad = () => {
    console.log('Loading GIF loaded successfully');
  };

  const handleImageError = (error: any) => {
    console.log('Loading GIF failed to load:', error);
  };

  // 송금 방식과 결과에 따른 메시지 생성
  const getDefaultMessage = () => {
    if (isSuccess) {
      return isBluetoothTransfer
        ? '블루투스 송금이 성공적으로 완료되었습니다.'
        : '송금이 성공적으로 완료되었습니다.';
    } else {
      return isBluetoothTransfer
        ? '블루투스 송금 처리 중 오류가 발생했습니다.'
        : '송금 처리 중 오류가 발생했습니다.';
    }
  };

  const displayMessage = message || getDefaultMessage();
  const titleText = isSuccess ? '송금 완료' : '송금 실패';
  const amountColor = isSuccess ? colors.primary : colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {isLoading ? (
          // 로딩 중: loading.gif 표시
          <Image
            source={require('@/modules/transfer/assets/loading.gif')}
            style={styles.loadingImage}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : showResult ? (
          // 완료 후: success/error 애니메이션 표시
          isSuccess ? (
            <LottieView
              source={require('@/modules/transfer/assets/success.json')}
              autoPlay
              loop={false}
              style={styles.successAnimation}
            />
          ) : (
            // 실패 시 failed.json 애니메이션 표시
            <LottieView
              source={require('@/modules/transfer/assets/failed.json')}
              autoPlay
              loop={false}
              style={styles.failedAnimation}
            />
          )
        ) : null}
      </View>

      {/* 로딩 중이 아닐 때만 텍스트 표시 */}
      {!isLoading && (
        <>
          <Text style={[typography.h2, styles.title]}>
            {titleText}
          </Text>
          <Text style={[typography.h2, styles.amountText, { color: amountColor }]}>
            {amount.toLocaleString('ko-KR')}원
          </Text>

          {!isBluetoothTransfer && recipientName && accountNumber && (
            <View style={styles.recipientInfo}>
              <Text style={[typography.body1, styles.recipientName]}>
                {recipientName}
              </Text>
              <Text style={[typography.body2, styles.accountNumber]}>
                {accountNumber}
              </Text>
            </View>
          )}

          <Text style={[typography.body1, styles.message]}>
            {displayMessage}
          </Text>
        </>
      )}

      {/* 로딩 중일 때 표시할 텍스트 */}
      {isLoading && (
        <Text style={[typography.h3, styles.loadingText]}>송금 처리 중...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  animationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  successAnimation: {
    width: '100%',
    height: '100%',
  },
  failedAnimation: {
    width: '60%',
    height: '60%',
  },
  loadingImage: {
    width: '60%',
    height: '60%',
  },
  title: {
    color: colors.black,
    marginBottom: 16,
  },
  amountText: {
    color: colors.primary,
    marginBottom: 20,
  },
  bluetoothInfo: {
    marginBottom: 16,
    color: colors.black,
  },
  bluetoothLabel: {
    color: colors.primary,
    fontWeight: '500',
  },
  userId: {
    fontWeight: 'normal',
  },
  recipientInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  recipientName: {
    color: colors.black,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountNumber: {
    color: colors.grey,
  },
  message: {
    color: colors.grey,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  loadingText: {
    color: colors.grey,
    marginTop: 20,
    textAlign: 'center',
  },
});
