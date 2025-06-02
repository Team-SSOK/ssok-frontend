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
import Toast from 'react-native-toast-message';
import { useTutorialStore } from '@/stores/tutorialStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { resetTutorial, hasSeenHomeTutorial, startHomeTutorial, isActive, currentStep } = useTutorialStore();

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

  // 페이지 이동 함수
  const navigateTo = (route: SettingsRoute) => {
    router.push(route);
  };

  // 튜토리얼 리셋 핸들러
  const handleTutorialReset = () => {
    Alert.alert(
      '튜토리얼 리셋',
      '튜토리얼을 리셋하시겠습니까?\n홈 화면으로 이동하면 튜토리얼이 다시 시작됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '리셋',
          style: 'destructive',
          onPress: () => {
            console.log('[DEBUG][Settings] 튜토리얼 리셋 전 상태:', {
              hasSeenHomeTutorial,
              isActive,
              currentStep,
            });
            
            resetTutorial();
            
            console.log('[DEBUG][Settings] 튜토리얼 리셋 후 상태:', {
              hasSeenHomeTutorial: useTutorialStore.getState().hasSeenHomeTutorial,
              isActive: useTutorialStore.getState().isActive,
              currentStep: useTutorialStore.getState().currentStep,
            });
            
            Toast.show({
              type: 'success',
              text1: '튜토리얼 리셋 완료',
              text2: '홈 화면으로 이동하면 튜토리얼이 시작됩니다.',
              position: 'bottom',
            });
          },
        },
      ],
    );
  };

  // 튜토리얼 강제 시작 핸들러 (완전 리셋 포함)
  const handleTutorialForceStart = () => {
    console.log('[DEBUG][Settings] 완전 리셋 후 튜토리얼 강제 시작');
    
    Alert.alert(
      '튜토리얼 완전 리셋',
      '튜토리얼을 완전히 리셋하고 즉시 시작하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시작',
          onPress: () => {
            // 1. 완전 리셋
            resetTutorial();
            
            // 2. 잠시 후 강제 시작
            setTimeout(() => {
              console.log('[DEBUG][Settings] 강제 시작 실행');
              const { startHomeTutorial } = useTutorialStore.getState();
              startHomeTutorial();
              
              // 3. 홈으로 이동
              router.push('/');
              
              Toast.show({
                type: 'success',
                text1: '튜토리얼 시작',
                text2: '홈 화면에서 튜토리얼이 시작됩니다.',
                position: 'bottom',
              });
            }, 500);
          },
        },
      ],
    );
  };

  // AsyncStorage 상태 확인 (디버그용)
  const handleCheckStorage = async () => {
    try {
      const storageData = await AsyncStorage.getItem('tutorial-storage');
      console.log('[DEBUG][Settings] AsyncStorage 내용:', storageData);
      
      Alert.alert(
        'AsyncStorage 상태',
        `저장된 데이터: ${storageData || '없음'}\n\n현재 상태:\n- hasSeenHomeTutorial: ${hasSeenHomeTutorial}\n- isActive: ${isActive}\n- currentStep: ${currentStep}`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('[ERROR][Settings] AsyncStorage 확인 실패:', error);
      Alert.alert('오류', 'AsyncStorage 확인 중 오류가 발생했습니다.');
    }
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

        {/* 개발자 섹션 */}
        <Section title="개발자">
          <SettingItem
            icon="bug-outline"
            label="AsyncStorage 상태 확인"
            onPress={handleCheckStorage}
          />
          <SettingItem
            icon="refresh-outline"
            label={`튜토리얼 리셋 ${hasSeenHomeTutorial ? '(완료됨)' : '(미완료)'}`}
            onPress={handleTutorialReset}
          />
          <SettingItem
            icon="play-outline"
            label={`튜토리얼 강제 시작 ${isActive ? '(진행중)' : '(대기중)'}`}
            onPress={handleTutorialForceStart}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.black,
  },
});
