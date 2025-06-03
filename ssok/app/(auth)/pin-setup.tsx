import React from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/modules/auth/store/authStore';
import PinScreen from '@/modules/auth/components/PinScreen';

export default function PinSetup() {
  const setPin = useAuthStore((state) => state.setPin);

  const handleComplete = (pin: string) => {
    // Zustand 스토어에 PIN 번호 저장
    setPin(pin);
    // PIN 번호 재입력 화면으로 이동
    router.push('/(auth)/pin-confirm');
    return true;
  };

  return <PinScreen title="PIN번호 설정" onComplete={handleComplete} />;
}
