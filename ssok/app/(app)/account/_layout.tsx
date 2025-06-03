import { Stack } from 'expo-router';
import React from 'react';

export default function AccountGroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" options={{ title: '계좌 상세' }} />
      <Stack.Screen name="register" options={{ title: '계좌 등록' }} />
    </Stack>
  );
}
