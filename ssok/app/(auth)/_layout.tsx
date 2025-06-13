import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/contexts/useSession';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useSession();

  console.log(
    '[AuthLayout] 렌더링. isAuthenticated:',
    isAuthenticated,
    'isLoading:',
    isLoading,
  );

  if (isLoading) {
    console.log('[AuthLayout] isLoading true. LoadingIndicator 표시.');
    return <LoadingIndicator visible={true} />;
  }

  if (isAuthenticated) {
    // 인증된 사용자는 (app)의 기본 화면으로 리디렉션
    console.log('[AuthLayout] isAuthenticated true. Redirect to /(app).');
    return <Redirect href="/(app)" />;
  }
  
  return <Stack screenOptions={{ headerShown: false }} />;
}
