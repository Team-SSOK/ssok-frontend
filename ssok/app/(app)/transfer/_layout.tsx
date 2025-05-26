import { Stack } from 'expo-router';
import React from 'react';

export default function TransferGroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: '계좌 선택' }} />
      <Stack.Screen name="amount" options={{ title: '금액 입력' }} />
      <Stack.Screen name="confirm" options={{ title: '이체 확인' }} />
      <Stack.Screen name="complete" options={{ title: '이체 완료' }} />
    </Stack>
  );
}
