import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { usePushNotifications } from '@/modules/notification';
import useDialog from '@/hooks/useDialog';
import DialogProvider from '@/components/DialogProvider';
import { typography } from '@/theme/typography';
import { colors } from '@/constants/colors';

const STORAGE_KEY = '@notification_permission_requested';

export default function NotificationPermissionScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { requestPermissionsAndRegisterToken } = usePushNotifications();
  const { showDialog, dialogState, hideDialog } = useDialog();

  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (value !== null) {
          // 이미 권한 요청 화면을 본 경우, 메인으로 이동
          router.replace('/(app)/(tabs)');
        } else {
          // 처음 접속 시, 로딩 완료 및 다이얼로그 표시
          setIsLoading(false);
          showPermissionDialog();
        }
      } catch (e) {
        console.error('Failed to read async storage for notification', e);
        // 에러 발생 시에도 일단 메인으로 보냄
        router.replace('/(app)/(tabs)');
      }
    };

    checkPermissionStatus();
  }, []);

  const handleAllowNotifications = async () => {
    try {
      await requestPermissionsAndRegisterToken();
    } catch (error) {
      console.error('Notification permission or token registration failed', error);
      // 실패하더라도 플로우는 계속 진행
    } finally {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      router.replace('/(app)/(tabs)');
    }
  };

  const handleDenyNotifications = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.error('Failed to write async storage for notification', e);
    } finally {
      router.replace('/(app)/(tabs)');
    }
  };
  
  const showPermissionDialog = () => {
    showDialog({
      title: `'SSOK'에서 알림을 보내고자 합니다.`,
      content: '경고, 사운드 및 아이콘 배지가 알림에 포함될 수 있습니다. 설정에서 이를 구성할 수 있습니다.',
      confirmText: '허용',
      cancelText: '허용 안 함',
      onConfirm: () => {
        hideDialog();
        handleAllowNotifications();
      },
      onCancel: () => {
        hideDialog();
        handleDenyNotifications();
      },
    });
  }

  if (isLoading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음
  }

  return (
    <>
    <LinearGradient
      colors={[colors.white, colors.tint2]}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.textContainer}>
          <Text style={[typography.h2, styles.title]}>입금 알림처럼 중요한 알림을 놓치지 않으려면 권한이 필요해요</Text>
          <Text style={[typography.body1, styles.subtitle]}>허용해도 동의 없이 광고 알림을 보내지 않아요.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
    <DialogProvider
        visible={dialogState.visible}
        title={dialogState.title}
        content={dialogState.content}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
        onDismiss={hideDialog}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  textContainer: {
    paddingHorizontal: 24,
    width: '100%',
  },
  title: {
    color: colors.black,
    textAlign: 'left',
    marginBottom: 16,
  },
  subtitle: {
    color: colors.black,
    textAlign: 'left',
  },
}); 