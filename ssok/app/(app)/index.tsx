import React from 'react';
import { Redirect } from 'expo-router';

export default function AppRootIndexScreen() {
  return <Redirect href="/(app)/(tabs)" />;
}
