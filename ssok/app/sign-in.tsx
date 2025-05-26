import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Pressable,
} from 'react-native';
import { Link, router, Redirect } from 'expo-router';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useSession } from '@/contexts/useSession';
import {
  useAuthStore,
  type AuthStoreState,
} from '@/modules/auth/store/authStore';
import Button from '@/components/Button';

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.content}>
        <View style={styles.authButtonContainer}>
          <Button
            title="PIN으로 시작하기"
            onPress={handleSignInPress}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          <Pressable
            onPress={handleRegisterPress}
            style={styles.registerLinkContainer}
          >
            <Text style={styles.registerLinkBaseText}>계정이 없으신가요? </Text>
            <Text style={styles.registerLinkActionText}>회원가입</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.grey,
    marginBottom: 70,
    textAlign: 'center',
  },
  authButtonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginBottom: 25,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    marginTop: 0,
    alignSelf: 'center',
  },
  registerLinkBaseText: {
    fontSize: 16,
    color: colors.black,
  },
  registerLinkActionText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  startButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: colors.white,
  },
});
