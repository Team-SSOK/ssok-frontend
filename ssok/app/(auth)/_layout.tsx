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

  console.log(
    '[AuthLayout] !isAuthenticated. Stack 표시. (auth) 그룹 화면을 보여줍니다.',
  );
  // 이 Stack은 (auth) 그룹 내의 화면들(register, pin-setup, pin-confirm, pin-login)을 위한 것입니다.
  // sign-in은 이제 이 그룹의 일부가 아닙니다.
  return <Stack screenOptions={{ headerShown: false }} />;
}
