import { Stack } from 'expo-router';
import React from 'react';

export default function TransferGroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: '송금' }} />
    </Stack>
  );
}
