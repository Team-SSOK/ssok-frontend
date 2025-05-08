import React from 'react';
import { Stack } from 'expo-router';

// Settings 섹션의 중첩 네비게이션을 위한 레이아웃
export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="app-intro"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
