import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { colors } from '@/constants/colors';
import { BleManager } from 'react-native-ble-plx';
import { router } from 'expo-router';
import { Header, Section, SettingItem } from '@/modules/settings';
import { usePushNotifications } from '@/modules/notification';
import Toast from 'react-native-toast-message';

// 라우트 타입 정의
type SettingsRoute =
  | '/(app)/(tabs)/settings/profile'
  | '/(app)/(tabs)/settings/help'
  | '/(app)/(tabs)/settings/privacy'
  | '/(app)/(tabs)/settings/support'
  | '/(app)/(tabs)/settings/app-intro';

export default function SettingsScreen() {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState<boolean>(false);
  const [bleManager] = useState(() => new BleManager());

  // 푸시 알림 상태 관리
  const {
    permissionStatus,
    isTokenRegistered,
    isLoading: notificationLoading,
    requestPermissionsAndRegisterToken,
    resetState: resetNotificationState,
  } = usePushNotifications();

  // 블루투스 상태 체크
  useEffect(() => {
    // 시스템 블루투스 상태 확인
    const checkSystemBluetoothStatus = async () => {
      try {
        // 시스템 블루투스 상태 확인
        const state = await bleManager.state();
        const isEnabled = state === 'PoweredOn';
        setIsBluetoothEnabled(isEnabled);

        // 이벤트 리스너 등록
        const subscription = bleManager.onStateChange((state) => {
          const isEnabled = state === 'PoweredOn';
          setIsBluetoothEnabled(isEnabled);
        }, true);

        return () => subscription.remove();
      } catch (error) {
        Toast.show({
          type: 'warning',
          text1: '블루투스 상태 확인 실패',
          text2: '블루투스 상태를 확인할 수 없습니다.',
          position: 'bottom',
        });
      }
    };

    checkSystemBluetoothStatus();

    // 컴포넌트 언마운트 시 정리
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  // 블루투스 설정 열기
  const openBluetoothSettings = () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
    } else {
      Linking.openSettings();
    }
  };

  // 블루투스 토글 처리
  const handleToggle = (value: boolean) => {
    if (value && !isBluetoothEnabled) {
      // 블루투스 켜기 시도 -> 시스템 설정으로 이동
      Alert.alert(
        '블루투스 설정',
        '블루투스를 켜려면 설정 화면으로 이동해야 합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: openBluetoothSettings },
        ],
      );
      return;
    }

    if (!value && isBluetoothEnabled) {
      // 블루투스 끄기 시도 -> 설정으로 이동
      Alert.alert(
        '블루투스 설정',
        '블루투스를 끄려면 설정 화면으로 이동해야 합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: openBluetoothSettings },
        ],
      );
      return;
    }
  };

  // 푸시 알림 토글 처리
  const handleNotificationToggle = async (value: boolean) => {
    if (value && !isTokenRegistered) {
      // 알림 켜기 시도
      try {
        await requestPermissionsAndRegisterToken();
        Toast.show({
          type: 'success',
          text1: '알림 설정 완료',
          text2: '푸시 알림이 활성화되었습니다.',
          position: 'bottom',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알림 설정에 실패했습니다.';
        
        if (errorMessage.includes('권한이 거부')) {
          Alert.alert(
            '알림 권한 필요',
            '푸시 알림을 받으려면 설정에서 알림 권한을 허용해야 합니다.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정으로 이동', onPress: () => Linking.openSettings() },
            ],
          );
        } else {
          Toast.show({
            type: 'error',
            text1: '알림 설정 실패',
            text2: errorMessage,
            position: 'bottom',
          });
        }
      }
    } else if (!value && isTokenRegistered) {
      // 알림 끄기 시도 - 토큰 상태만 리셋 (서버에서는 비활성화해야 함)
      Alert.alert(
        '알림 끄기',
        '푸시 알림을 끄시겠습니까?\n설정에서 다시 켤 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '끄기',
            onPress: () => {
              resetNotificationState();
              Toast.show({
                type: 'info',
                text1: '알림 비활성화',
                text2: '푸시 알림이 비활성화되었습니다.',
                position: 'bottom',
              });
            },
          },
        ],
      );
    }
  };

  // 알림 상태에 따른 표시 텍스트
  const getNotificationStatusText = () => {
    if (notificationLoading) return '설정 중...';
    if (permissionStatus === 'denied') return '권한 거부됨';
    if (permissionStatus === 'granted' && isTokenRegistered) return '활성화됨';
    return '비활성화됨';
  };

  // 페이지 이동 함수
  const navigateTo = (route: SettingsRoute) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* 헤더 */}
      <Header title="설정" showBackButton={false} />

      <ScrollView style={styles.content}>
        {/* 계정 설정 섹션 */}
        <Section title="계정 설정">
          <SettingItem
            icon="person-outline"
            label="내 프로필"
            onPress={() => navigateTo('/(app)/(tabs)/settings/profile')}
          />
          <SettingItem icon="lock-closed-outline" label="PIN 번호 변경" />
        </Section>

        {/* 앱 설정 섹션 */}
        <Section title="앱 설정">
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>푸시 알림</Text>
              <Text style={styles.statusText}>
                {getNotificationStatusText()}
              </Text>
            </View>
            <Switch
              trackColor={{ false: colors.silver, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.silver}
              onValueChange={handleNotificationToggle}
              value={isTokenRegistered}
              disabled={notificationLoading}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>블루투스 사용</Text>
            </View>
            <Switch
              trackColor={{ false: colors.silver, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.silver}
              onValueChange={handleToggle}
              value={isBluetoothEnabled}
            />
          </View>
          <SettingItem
            icon="information-circle-outline"
            label="앱 소개"
            onPress={() =>
              navigateTo('/(tabs)/settings/app-intro' as SettingsRoute)
            }
          />
        </Section>

        {/* 지원 섹션 */}
        <Section title="지원">
          <SettingItem
            icon="help-circle-outline"
            label="도움말"
            onPress={() => navigateTo('/(app)/(tabs)/settings/help')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            label="개인정보처리방침"
            onPress={() => navigateTo('/(app)/(tabs)/settings/privacy')}
          />
          <SettingItem
            icon="call-outline"
            label="고객센터"
            onPress={() => navigateTo('/(app)/(tabs)/settings/support')}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  settingLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.black,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 15,
    marginTop: 2,
    color: colors.grey,
  },
});
