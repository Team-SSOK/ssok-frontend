import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import Header from '@/components/CommonHeader';
import { Text } from '@/components/TextProvider';
import { useTransferFlow } from '../hooks/useTransferFlow';
import { TransferStep, TransferFlowData } from '../types/transferFlow';
import { createTextFadeTransition } from '../utils/animations';

// 스텝 컴포넌트들
import AccountStep from './steps/AccountStep';
import AmountStep from './steps/AmountStep';
import CompleteStep from './steps/CompleteStep';

interface TransferFlowProps {
  sourceAccountId?: string;
  initialStep?: TransferStep;
  initialData?: Partial<TransferFlowData>;
}

/**
 * 송금 플로우 메인 컴포넌트
 * 모든 송금 스텝을 하나의 페이지에서 관리합니다
 */
export default function TransferFlow({
  sourceAccountId,
  initialStep = 'account',
  initialData = {},
}: TransferFlowProps) {
  const {
    currentStep,
    data,
    isLoading,
    error,
    goToNext,
    goToPrevious,
    reset,
    updateData,
  } = useTransferFlow(initialStep);

  const [headerTitle, setHeaderTitle] = useState('');

  console.log('🔄 송금 플로우 데이터', initialData);

  // 초기 데이터 설정
  useEffect(() => {
    const dataToUpdate = { ...initialData };
    
    // sourceAccountId가 있으면 데이터에 포함
    if (sourceAccountId) {
      dataToUpdate.sourceAccountId = sourceAccountId;
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
      updateData(dataToUpdate);
    }
  }, [initialData, sourceAccountId, updateData]);

  // 스텝별 헤더 타이틀
  const getHeaderTitle = (step: TransferStep): string => {
    switch (step) {
      case 'account':
        return '어디로 보낼까요?';
      case 'amount':
        return data.isBluetoothTransfer
          ? `${data.userName}님에게 송금`
          : '얼마를 보낼까요?';
      case 'complete':
        return '송금 완료';
      default:
        return '송금';
    }
  };

  // 스텝 변경 시 헤더 타이틀 애니메이션
  useEffect(() => {
    const newTitle = getHeaderTitle(currentStep);
    if (headerTitle !== newTitle) {
      createTextFadeTransition();
      setHeaderTitle(newTitle);
    }
  }, [currentStep, headerTitle]);

  // 뒤로가기 처리
  const handleBack = () => {
    console.log('=== TransferFlow handleBack ===');
    console.log('currentStep:', currentStep);
    console.log('sourceAccountId:', sourceAccountId);

    if (currentStep === 'account') {
      console.log('Going back from account step');
      // 첫 번째 스텝에서는 이전 화면으로 돌아가기
      if (sourceAccountId) {
        console.log('Navigating to account detail:', sourceAccountId);
        // 계좌 ID가 있으면 해당 계좌 상세 화면으로 이동
        router.replace(`/account/${sourceAccountId}` as any);
      } else {
        console.log('Using router.back()');
        // 계좌 ID가 없으면 일반적인 뒤로가기
        router.back();
      }
    } else if (currentStep === 'complete') {
      console.log('Going back from complete step');
      // 완료 스텝에서는 홈으로 이동
      router.replace('/(tabs)' as any);
    } else {
      console.log('Going to previous step from:', currentStep);
      // 다른 스텝에서는 이전 스텝으로 이동
      goToPrevious();
    }
    console.log('=== End handleBack ===');
  };

  // 현재 스텝에 따른 컴포넌트 렌더링
  const renderCurrentStep = () => {
    const stepProps = {
      data,
      onNext: goToNext,
      onBack: goToPrevious,
    };

    switch (currentStep) {
      case 'account':
        return <AccountStep {...stepProps} />;
      case 'amount':
        return <AmountStep {...stepProps} />;
      case 'complete':
        return <CompleteStep {...stepProps} />;
      default:
        return <AccountStep {...stepProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 - 완료 스텝에서는 헤더 숨김 */}
      {currentStep !== 'complete' && (
        <Header title={headerTitle} onBackPress={handleBack} />
      )}

      {/* 현재 스텝 컴포넌트 렌더링 */}
      <View style={styles.content}>{renderCurrentStep()}</View>

      {/* 에러 표시 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          {/* 로딩 인디케이터는 각 스텝 컴포넌트에서 처리 */}
        </View>
      )}
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
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  errorText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
