import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTutorialStore, TutorialStep } from '@/stores/tutorialStore';
import TutorialTooltip, { TooltipPosition } from './TutorialTooltip';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 홈 튜토리얼 props 타입
 */
interface HomeTutorialProps {
  // AccountCard 관련
  accountCardRef?: React.RefObject<View | null>;
  
  // 바텀 탭 관련  
  transferTabRef?: React.RefObject<View | null>;
  settingsTabRef?: React.RefObject<View | null>;
  
  // 튜토리얼 제어
  onTabPress?: (tabName: 'transfer' | 'settings') => void;
}

/**
 * 각 단계별 튜토리얼 정보
 */
const TUTORIAL_CONFIG: Record<TutorialStep, {
  title: string;
  message: string;
  position: TooltipPosition;
  nextButtonText?: string;
}> = {
  swipe: {
    title: '계좌 카드 스와이프',
    message: '계좌 카드를 좌우로 스와이프하여\n여러 계좌를 확인할 수 있어요',
    position: 'bottom',
  },
  longPress: {
    title: '주계좌 변경',
    message: '계좌 카드를 길게 누르면\n주계좌로 변경할 수 있어요',
    position: 'bottom',
  },
  transfer: {
    title: '송금하기',
    message: '하단의 송금 탭을 눌러\n간편하게 송금을 진행하세요',
    position: 'top',
  },
  settings: {
    title: '설정 및 정보',
    message: '설정 탭에서 앱 및 사용자 정보를\n확인하고 관리할 수 있어요',
    position: 'top',
    nextButtonText: '완료',
  },
};

/**
 * 홈 튜토리얼 컴포넌트
 */
export default function HomeTutorial({
  accountCardRef,
  transferTabRef,
  settingsTabRef,
  onTabPress,
}: HomeTutorialProps) {
  const insets = useSafeAreaInsets();
  const { isActive, currentStep, nextStep, skipTutorial } = useTutorialStore();
  
  // 컴포넌트 위치 정보 저장
  const [elementPositions, setElementPositions] = useState<Record<string, {
    x: number;
    y: number;
    width: number;
    height: number;
  }>>({});

  /**
   * 컴포넌트 위치 측정
   */
  const measureElement = (
    ref: React.RefObject<View | null> | undefined,
    key: string
  ) => {
    if (!ref?.current) return;

    ref.current.measure((
      x: number, 
      y: number, 
      width: number, 
      height: number, 
      pageX: number, 
      pageY: number
    ) => {
      setElementPositions(prev => ({
        ...prev,
        [key]: { x: pageX, y: pageY, width, height },
      }));
    });
  };

  /**
   * 모든 엘리먼트 위치 측정
   */
  useEffect(() => {
    if (!isActive) return;

    const measureTimeout = setTimeout(() => {
      measureElement(accountCardRef, 'accountCard');
      measureElement(transferTabRef, 'transferTab');
      measureElement(settingsTabRef, 'settingsTab');
    }, 100); // 레이아웃 완료 후 측정

    return () => clearTimeout(measureTimeout);
  }, [isActive, accountCardRef, transferTabRef, settingsTabRef]);

  /**
   * 현재 단계의 타겟 위치 정보 가져오기
   */
  const getCurrentTarget = () => {
    if (!currentStep) return null;

    let targetKey = '';
    switch (currentStep) {
      case 'swipe':
      case 'longPress':
        targetKey = 'accountCard';
        break;
      case 'transfer':
        targetKey = 'transferTab';
        break;
      case 'settings':
        targetKey = 'settingsTab';
        break;
    }

    const target = elementPositions[targetKey];
    if (!target) return null;

    return target;
  };

  /**
   * 다음 단계로 이동 처리
   */
  const handleNext = () => {
    if (currentStep === 'transfer' && onTabPress) {
      // 송금 탭으로 이동하지 않고 바로 다음 단계로
      nextStep();
    } else if (currentStep === 'settings' && onTabPress) {
      // 설정 탭으로 이동하지 않고 바로 완료
      nextStep();
    } else {
      nextStep();
    }
  };

  /**
   * 튜토리얼 건너뛰기
   */
  const handleSkip = () => {
    skipTutorial();
  };

  // 비활성 상태면 렌더링하지 않음
  if (!isActive || !currentStep) {
    return null;
  }

  const target = getCurrentTarget();
  const config = TUTORIAL_CONFIG[currentStep];

  // 타겟 위치가 측정되지 않았으면 렌더링하지 않음
  if (!target) {
    return null;
  }

  return (
    <TutorialTooltip
      visible={isActive}
      title={config.title}
      message={config.message}
      position={config.position}
      targetX={target.x}
      targetY={target.y}
      targetWidth={target.width}
      targetHeight={target.height}
      onNext={handleNext}
      onSkip={handleSkip}
      nextButtonText={config.nextButtonText}
      showNextButton={true}
      showSkipButton={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
}); 