import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { colors } from '@/constants/colors';
import { generateUUID } from '@/utils/ble';
import BluetoothRadar from '@/modules/bluetooth/components/BluetoothRadar';
import { router, useFocusEffect } from 'expo-router';
import Loading from '@/components/LoadingIndicator';
import Header from '@/components/CommonHeader';
import { useBluetoothStore } from '@/modules/bluetooth/stores/bluetoothStore';
import { useProfileStore } from '@/modules/settings/store/profileStore';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useBleScanner, DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';
import { useBleAdvertiser } from '@/modules/bluetooth/hooks/useBleAdvertiser';

const BluetoothScreen: React.FC = () => {
  // 고유 UUID 생성 (한 번만)
  const [myUUID] = useState<string>(() => generateUUID());

  // 스토어 상태 및 액션
  const {
    setup,
    matchFoundUsers,
    clearInactiveDevices,
    getMatchedUserByUuid,
    primaryAccount,
    isLoading: isStoreLoading,
    error: storeError,
    reset,
  } = useBluetoothStore();

  // 현재 사용자 정보
  const userId = useAuthStore(state => state.user?.id);
  const { profileImage, fetchProfile } = useProfileStore();

  // BLE 훅 사용
  const { isScanning, error: scannerError, startScan, stopScan } = useBleScanner();
  const { isAdvertising, error: advertiserError, startAdvertising, stopAdvertising } = useBleAdvertiser(myUUID);

  // 화면 로딩 상태
  const isLoading = isStoreLoading;

  // 화면 포커스/블러 시 처리
  useFocusEffect(
    useCallback(() => {
      console.log('[BluetoothScreen] Focus: Setting up services.');
      setup(myUUID);
      if (userId) {
        fetchProfile(userId);
      }

      // 탭 전환 시 경합 상태를 막기 위해 짧은 지연 후 BLE 서비스 시작
      const startTimer = setTimeout(() => {
        console.log('[BluetoothScreen] Starting BLE services after delay.');
        startAdvertising();
        startScan();
      }, 200);

      const matchInterval = setInterval(() => {
        matchFoundUsers();
      }, 2000); // 2초마다 매칭 시도
      const cleanupInterval = setInterval(() => {
        clearInactiveDevices();
      }, 5000); // 5초마다 비활성 기기 정리

      return () => {
        console.log('[BluetoothScreen] Blur: Cleaning up services.');
        // 시작 타이머가 실행되기 전에 화면을 벗어나면 타이머 취소
        clearTimeout(startTimer);

        // BLE 기능 중지
        stopAdvertising();
        stopScan();

        // 상태 초기화 및 인터벌 정리
        reset();
        clearInterval(matchInterval);
        clearInterval(cleanupInterval);
        console.log('[BluetoothScreen] Cleanup complete.');
      };
    }, [myUUID, userId]),
  );

  // 에러 통합 처리
  useEffect(() => {
    const error = storeError || scannerError || advertiserError;
    if (error) {
      Toast.show({
        type: 'error',
        text1: '블루투스 오류',
        text2: error,
        position: 'bottom',
      });
    }
  }, [storeError, scannerError, advertiserError]);

  // 사용자 선택 핸들러
  const handleDevicePress = (device: DiscoveredDevice) => {
    if (!device.iBeaconData) {
      Alert.alert('오류', '기기 정보를 불러올 수 없습니다.');
      return;
    }

    const uuid = device.iBeaconData.uuid;
    const matchedUser = getMatchedUserByUuid(uuid);

    if (!matchedUser) {
      Alert.alert('오류', '서버에서 사용자 정보를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!primaryAccount) {
      Alert.alert('오류', '주계좌 정보가 없습니다. 계좌를 먼저 등록해주세요.');
      return;
    }

      router.push({
        pathname: '/transfer',
        params: {
          uuid: matchedUser.uuid,
          userName: matchedUser.username,
        // primaryAccount에서 bankCode를 가져와야 합니다. getBankNameByCode는 utils에 있다고 가정합니다.
        // 이 부분은 getBankNameByCode의 위치에 따라 수정이 필요할 수 있습니다.
        bankName: primaryAccount.bankCode.toString(), 
        isBluetooth: 'true',
        },
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="블루투스 송금" />
      <View style={styles.container}>
        <BluetoothRadar
          isScanning={isScanning}
          myUUID={myUUID}
          profileImage={profileImage}
          onDevicePress={handleDevicePress}
        />
      </View>
      <Loading visible={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
});

export default BluetoothScreen;
