import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  FadeInUp,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { useAccountStore } from '@/modules/account/stores/useAccountStore';
import { StepComponentProps } from '../../types/transferFlow';
import AmountHeader from '../AmountHeader';
import AmountDisplay from '../AmountDisplay';
import TransferKeypad from '../TransferKeypad';
import ConfirmQuestion from '../ConfirmQuestion';
import ConfirmButton from '../ConfirmButton';

/**
 * 금액 입력 및 확인 스텝 컴포넌트
 * 입력 모드와 확인 모드를 하나의 컴포넌트에서 처리하며,
 * 부드러운 애니메이션으로 전환됩니다.
 */
export default function AmountStep({
  data,
  onNext,
  onBack,
}: StepComponentProps) {
  const [amount, setAmount] = useState<string>('');
  const [btnEnabled, setBtnEnabled] = useState<boolean>(false);
  const [isConfirmMode, setIsConfirmMode] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);

  const { accounts } = useAccountStore();

  // 애니메이션 값들
  const inputElementsOpacity = useSharedValue(1);
  const confirmElementsOpacity = useSharedValue(0);
  const confirmElementsTranslateY = useSharedValue(50);

  // 기본 계좌 정보 가져오기
  const primaryAccount =
    accounts.find((acc) => acc.isPrimaryAccount) || accounts[0];
  const accountBalance = primaryAccount?.balance || 0;
  const accountDisplayName = primaryAccount
    ? `내 ${primaryAccount.bankName} 계좌`
    : '내 계좌';

  // 금액 입력 상태에 따른 버튼 활성화
  useEffect(() => {
    const numericAmount = parseInt(amount.replace(/,/g, '')) || 0;
    const shouldShowButton = numericAmount > 0;
    setBtnEnabled(shouldShowButton);
    setShowNextButton(shouldShowButton);
  }, [amount]);

  // 숫자 포맷팅 (천 단위 콤마)
  const formatNumber = (num: string) => {
    const number = num.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 키패드 입력 처리
  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      setAmount((prev) => {
        const newAmount = prev.slice(0, -1);
        return formatNumber(newAmount);
      });
      return;
    }

    if (key === '00') {
      setAmount((prev) => {
        const currentNumber = prev.replace(/,/g, '');
        if (currentNumber === '' || currentNumber === '0') return prev;
        const newNumber = currentNumber + '00';
        if (newNumber.length > 10) return prev; // 최대 100억원 제한
        return formatNumber(newNumber);
      });
      return;
    }

    // 일반 숫자 입력
    setAmount((prev) => {
      const currentNumber = prev.replace(/,/g, '');
      if (currentNumber === '0') return formatNumber(key);
      const newNumber = currentNumber + key;
      if (newNumber.length > 10) return prev; // 최대 100억원 제한
      return formatNumber(newNumber);
    });
  };

  // 잔액 전체 입력
  const handleBalanceInput = () => {
    setAmount(accountBalance.toLocaleString('ko-KR'));
  };

  // 확인 모드로 전환
  const handleConfirmMode = () => {
    // 먼저 다음 버튼을 숨김 (부드러운 사라짐을 위해)
    setShowNextButton(false);

    // 1단계: 기존 요소들을 부드럽게 fade out하면서 위로 살짝 이동
    inputElementsOpacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    // 2단계: 확인 요소들이 아래에서 위로 부드럽게 등장
    setTimeout(() => {
      runOnJS(setIsConfirmMode)(true);

      // 확인 질문이 중앙에서 부드럽게 등장
      confirmElementsOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });

      // 아래에서 위로 부드럽게 슬라이드
      confirmElementsTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.back(1.1)),
      });
    }, 250);
  };

  // 입력 모드로 돌아가기
  const handleBackToInput = () => {
    // 확인 요소들이 아래로 사라지면서 fade out
    confirmElementsOpacity.value = withTiming(0, {
      duration: 350,
      easing: Easing.in(Easing.cubic),
    });
    confirmElementsTranslateY.value = withTiming(30, {
      duration: 350,
      easing: Easing.in(Easing.cubic),
    });

    // 입력 요소들이 부드럽게 다시 등장
    setTimeout(() => {
      runOnJS(setIsConfirmMode)(false);
      inputElementsOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
      // 다음 버튼도 다시 표시 (금액이 있다면)
      const numericAmount = parseInt(amount.replace(/,/g, '')) || 0;
      if (numericAmount > 0) {
        runOnJS(setShowNextButton)(true);
      }
    }, 200);
  };

  // 송금 확인
  const handleConfirm = () => {
    const numericAmount = parseInt(amount.replace(/,/g, '')) || 0;

    // 확인 버튼 클릭 시 부드러운 fade out
    confirmElementsOpacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.in(Easing.quad),
    });

    setTimeout(() => {
      onNext({ amount: numericAmount, isConfirmed: true });
    }, 150);
  };

  // 애니메이션 스타일
  const inputElementsStyle = useAnimatedStyle(() => ({
    opacity: inputElementsOpacity.value,
    transform: [
      {
        translateY: withTiming(inputElementsOpacity.value === 0 ? -15 : 0, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        }),
      },
      {
        scale: withTiming(inputElementsOpacity.value === 0 ? 0.98 : 1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  const confirmElementsStyle = useAnimatedStyle(() => ({
    opacity: confirmElementsOpacity.value,
    transform: [
      { translateY: confirmElementsTranslateY.value },
      {
        scale: withTiming(confirmElementsOpacity.value === 1 ? 1 : 0.95, {
          duration: 600,
          easing: Easing.out(Easing.back(1.1)),
        }),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      {!isConfirmMode ? (
        // 입력 모드
        <Animated.View style={[styles.inputMode, inputElementsStyle]}>
          {/* 헤더 - 계좌 정보 및 수취인 정보 */}
          <AmountHeader
            accountDisplayName={accountDisplayName}
            recipientName={data.userName || '수취인'}
            bankName={data.selectedBank?.name || ''}
            accountNumber={
              data.isBluetoothTransfer ? undefined : data.accountNumber || ''
            }
          />

          {/* 금액 표시 및 입력 */}
          <AmountDisplay
            amount={amount}
            accountBalance={accountBalance}
            onBalanceInput={handleBalanceInput}
          />

          {/* 하단 여백 */}
          <View style={styles.bottomSpace} />

          {/* 키패드 및 다음 버튼 */}
          <TransferKeypad
            onKeyPress={handleKeyPress}
            onNext={handleConfirmMode}
            showNextButton={showNextButton}
          />
        </Animated.View>
      ) : (
        // 확인 모드
        <Animated.View style={[styles.confirmMode, confirmElementsStyle]}>
          <View style={styles.confirmContent}>
            {/* 확인 질문 */}
            <ConfirmQuestion
              recipientName={data.userName || '수취인'}
              amount={parseInt(amount.replace(/,/g, '')) || 0}
            />

            {/* 확인 버튼들 */}
            <View style={styles.confirmButtons}>
              <Animated.View
                entering={FadeInUp.delay(700)
                  .duration(400)
                  .easing(Easing.out(Easing.back(1.2)))}
                style={styles.backButton}
              >
                <ConfirmButton
                  title="이전"
                  variant="secondary"
                  onPress={handleBackToInput}
                />
              </Animated.View>
              <Animated.View
                entering={FadeInUp.delay(800)
                  .duration(400)
                  .easing(Easing.out(Easing.back(1.2)))}
                style={styles.confirmButton}
              >
                <ConfirmButton
                  title="보내기"
                  variant="primary"
                  onPress={handleConfirm}
                />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  inputMode: {
    flex: 1,
  },
  confirmMode: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmContent: {
    width: '100%',
    alignItems: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
    width: '100%',
  },
  backButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  bottomSpace: {
    height: 100,
  },
});
