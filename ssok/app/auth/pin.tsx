import React from 'react';
import { router } from 'expo-router';
import { usePin } from '@/contexts/PinContext';
import PinScreen from '@/modules/auth/components/PinScreen';

export default function PinSetup() {
  const { setPin: setContextPin } = usePin();

  const handleComplete = (pin: string) => {
    // Context에 PIN 번호 저장
    setContextPin(pin);
    // PIN 번호 재입력 화면으로 이동
    router.push('/auth/pin-confirm');
    return true;
  };

  return <PinScreen title="PIN번호 설정" onComplete={handleComplete} />;
}
