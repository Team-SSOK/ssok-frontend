import React, { useState, useEffect } from 'react';
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

// 라우트 타입 정의
type SettingsRoute =
  | '/(tabs)/settings/profile'
  | '/(tabs)/settings/help'
  | '/(tabs)/settings/privacy'
  | '/(tabs)/settings/support';

export default function SettingsScreen() {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState<boolean>(false);
  const [bleManager] = useState(() => new BleManager());

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
        console.error('블루투스 상태 확인 오류:', error);
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

  // 페이지 이동 함수
  const navigateTo = (route: SettingsRoute) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 */}
      <Header title="설정" showBackButton={false} />

      <ScrollView style={styles.content}>
        {/* 계정 설정 섹션 */}
        <Section title="계정 설정">
          <SettingItem
            icon="person-outline"
            label="내 프로필"
            onPress={() => navigateTo('/(tabs)/settings/profile')}
          />
          <SettingItem icon="lock-closed-outline" label="PIN 번호 변경" />
        </Section>

        {/* 앱 설정 섹션 */}
        <Section title="앱 설정">
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
        </Section>

        {/* 지원 섹션 */}
        <Section title="지원">
          <SettingItem
            icon="help-circle-outline"
            label="도움말"
            onPress={() => navigateTo('/(tabs)/settings/help')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            label="개인정보처리방침"
            onPress={() => navigateTo('/(tabs)/settings/privacy')}
          />
          <SettingItem
            icon="call-outline"
            label="고객센터"
            onPress={() => navigateTo('/(tabs)/settings/support')}
          />
        </Section>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.black,
  },
});
