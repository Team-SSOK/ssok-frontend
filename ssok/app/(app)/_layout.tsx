import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/contexts/useSession';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingIndicator visible={true} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="account" />
      <Stack.Screen name="transfer" />
    </Stack>
  );
}
