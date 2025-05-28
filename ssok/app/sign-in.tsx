import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { router, Redirect } from 'expo-router';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useSession } from '@/contexts/useSession';
import { OnboardingScreen } from '@/modules/onboarding';

import {
  useAuthStore,
  type AuthStoreState,
} from '@/modules/auth/store/authStore';

export default function SignInScreen() {
  const { isAuthenticated, isLoading } = useSession();

  const isUserRegistered = useAuthStore((state: AuthStoreState) =>
    state.isUserRegistered(),
  );

  const handleSignInPress = () => {
    router.push('/(auth)/pin-login');
  };

  const handleRegisterPress = () => {
    router.push('/(auth)/register');
  };

  if (isLoading) {
    return <LoadingIndicator visible={true} />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  if (!isAuthenticated && isUserRegistered) {
    return <Redirect href="/(auth)/pin-login" />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingScreen onComplete={handleRegisterPress} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
