import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import bleService from '@/modules/bluetooth/services/bleService';
import { DiscoveredDevice } from '@/modules/bluetooth/hooks/useBleScanner';
import { generateUUID } from '@/utils/ble';
import BluetoothRadar from '@/modules/bluetooth/components/BluetoothRadar';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import Loading from '@/components/LoadingIndicator';
import Header from '@/components/Header';
import { useBluetoothStore } from '@/modules/bluetooth/stores/useBluetoothStore';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { getBankNameByCode } from '@/modules/transfer/utils/bankUtils';

const BluetoothScreen: React.FC = () => {
  // 블루투스 상태
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [myUUID, setMyUUID] = useState<string>(generateUUID());
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDevice[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // 스토어
  const { registerUuid, updateDiscoveredDevices, primaryAccount, error } =
    useBluetoothStore();

  // 기기 활성 상태 정리 함수
  const cleanupInactiveDevices = useCallback(() => {
    const now = new Date();
    setDiscoveredDevices((prev) => {
      return prev.filter((device) => {
        // lastSeen이 없거나 현재 시간에서 10초 이상 지난 기기는 제외
        // 이 값을 늘려 기기가 더 오래 레이더에 유지되도록 설정
        if (!device.lastSeen) return false;

        const diffMs = now.getTime() - device.lastSeen.getTime();
        return diffMs < 10000; // 10초 이내에 발견된 기기만 유지
      });
    });
  }, []);

  // 주기적으로 기기 목록 정리 (1초마다)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupInactiveDevices();
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [cleanupInactiveDevices]);

  // API 오류 감지 및 알림
  useEffect(() => {
    if (error) {
      Alert.alert('오류', error);
    }
  }, [error]);

  // 화면 포커스/블러 처리
  useFocusEffect(
    useCallback(() => {
      // 화면에 진입했을 때 BLE 서비스 초기화 및 시작
      const initService = async () => {
        const initialized = await bleService.initialize({
          advertisingUUID: myUUID,
          autoStart: false,
        });

        if (initialized) {
          // UUID 업데이트
          setMyUUID(bleService.getMyUUID());

          // UUID API 등록
          await registerUuid(bleService.getMyUUID());

          // 앱 진입 시 자동으로 광고 및 스캔 시작
          startAdvertisingAndScanning();
        }
      };

      initService();

      // 화면을 벗어날 때 정리
      return () => {
        bleService.stopAdvertising();
        bleService.stopScanning();
      };
    }, [myUUID, registerUuid]),
  );

  // BLE 서비스 이벤트 리스너 등록
  useEffect(() => {
    const removeListener = bleService.addListener({
      onPeerDiscovered: (device) => {
        setDiscoveredDevices((prev) => {
          // 현재 시간 업데이트
          const updatedDevice = {
            ...device,
            lastSeen: new Date(),
          };

          // 이미 있는 기기인지 확인
          const exists = prev.some((d) => d.id === device.id);
          if (exists) {
            // 기존 기기 업데이트
            return prev.map((d) => (d.id === device.id ? updatedDevice : d));
          }
          // 새 기기 추가
          return [...prev, updatedDevice];
        });
      },
      onAdvertisingStarted: (uuid) => {
        setIsAdvertising(true);
      },
      onAdvertisingStopped: () => {
        setIsAdvertising(false);
      },
      onScanningStarted: () => {
        setIsScanning(true);
        // 스캔 시작 시 기존 발견 목록 초기화
        setDiscoveredDevices([]);
      },
      onScanningStopped: () => {
        setIsScanning(false);
      },
      onError: (error) => {
        console.error('BLE 오류:', error);
        Alert.alert('오류', error);
      },
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      removeListener();
      bleService.cleanup();
    };
  }, []);

  // 발견된 기기 목록이 변경될 때마다 사용자 조회 시도
  useEffect(() => {
    if (discoveredDevices.length > 0) {
      updateDiscoveredDevices(discoveredDevices);
    }
  }, [discoveredDevices, updateDiscoveredDevices]);

  // 광고 및 스캔 시작 함수
  const startAdvertisingAndScanning = async () => {
    try {
      // 광고 시작
      const advSuccess = await bleService.startAdvertising();
      if (!advSuccess) {
        console.warn('BLE 광고를 시작할 수 없습니다.');
      }

      // 스캔 시작
      const scanSuccess = await bleService.startScanning();
      if (!scanSuccess) {
        console.warn('BLE 스캔을 시작할 수 없습니다.');
      }
    } catch (error) {
      console.error('BLE 오류:', error);
    }
  };

  // 사용자 선택 핸들러
  const handleDevicePress = (device: DiscoveredDevice) => {
    if (!device.iBeaconData) {
      Alert.alert('오류', '기기 정보를 불러올 수 없습니다.', [
        { text: '확인', style: 'default' },
      ]);
      return;
    }

    // 발견된 UUID와 일치하는 사용자 찾기
    const uuid = device.iBeaconData.uuid;
    const matchedUser = useBluetoothStore.getState().getUserByUuid(uuid);

    if (!matchedUser) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.', [
        { text: '확인', style: 'default' },
      ]);
      return;
    }

    // 로딩 상태 활성화
    setIsLoading(true);

    // 은행 정보 가져오기
    const bankName = primaryAccount
      ? getBankNameByCode(primaryAccount.bankCode)
      : '은행';

    // 실제 사용자 정보 사용
    setTimeout(() => {
      // 로딩 상태 비활성화
      setIsLoading(false);

      // 송금 페이지로 이동 (userId 포함하여 전달)
      router.push({
        pathname: '/transfer',
        params: {
          userId: matchedUser.userId.toString(),
          userName: matchedUser.username,
          bankName: bankName,
          isBluetooth: 'true', // 블루투스 송금 플래그
        },
      });
    }, 1000); // 1초 지연으로 API 호출 시뮬레이션
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="블루투스 송금" />
      <View style={styles.container}>
        <BluetoothRadar
          devices={discoveredDevices}
          isScanning={isScanning}
          myUUID={myUUID}
          onDevicePress={handleDevicePress}
        />
      </View>

      {/* 로딩 컴포넌트 - 사용자 상호작용 시에만 표시 (배경 스캔 시에는 표시하지 않음) */}
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
