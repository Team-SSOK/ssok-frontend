import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { usePin } from '@/contexts/PinContext';
import AuthStorage from '@/services/AuthStorage';

export function useAuthFlow() {
  const { isLoggedIn } = usePin();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const verifyUserStatus = async () => {
      try {
        const isRegistered = await AuthStorage.isUserRegistered();

        if (isRegistered && !isLoggedIn) {
          router.replace('/auth/pin-login');
        } else if (isLoggedIn) {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('[Error]:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    verifyUserStatus();
  }, [isLoggedIn]);

  return { checkingStatus };
}
