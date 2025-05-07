import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import bleService from '@/modules/bluetooth/services/bleService';
import { DiscoveredDevice } from '@/hooks/useBleScanner';
import { generateUUID } from '@/utils/ble';
import BluetoothRadar from '@/modules/bluetooth/components/BluetoothRadar';
import { useFocusEffect } from '@react-navigation/native';

const BluetoothScreen: React.FC = () => {
  // 블루투스 상태
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [myUUID, setMyUUID] = useState<string>(generateUUID());
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDevice[]
  >([]);

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

  // 화면 포커스/블러 처리
  useFocusEffect(
    useCallback(() => {
      console.log('블루투스 화면 진입 - 광고/스캔 시작');
      // 화면에 진입했을 때 BLE 서비스 초기화 및 시작
      const initService = async () => {
        const initialized = await bleService.initialize({
          advertisingUUID: myUUID,
          autoStart: false,
        });

        if (initialized) {
          // UUID 업데이트
          setMyUUID(bleService.getMyUUID());

          // 앱 진입 시 자동으로 광고 및 스캔 시작
          startAdvertisingAndScanning();
        }
      };

      initService();

      // 화면을 벗어날 때 정리
      return () => {
        console.log('블루투스 화면 이탈 - 광고/스캔 중지');
        bleService.stopAdvertising();
        bleService.stopScanning();
      };
    }, [myUUID]),
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
        console.log('광고 시작:', uuid);
        setIsAdvertising(true);
      },
      onAdvertisingStopped: () => {
        console.log('광고 중지');
        setIsAdvertising(false);
      },
      onScanningStarted: () => {
        console.log('스캔 시작');
        setIsScanning(true);
        // 스캔 시작 시 기존 발견 목록 초기화
        setDiscoveredDevices([]);
      },
      onScanningStopped: () => {
        console.log('스캔 중지');
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

  // 광고 및 스캔 시작 함수
  const startAdvertisingAndScanning = async () => {
    try {
      // 광고 시작
      const advSuccess = await bleService.startAdvertising();
      if (!advSuccess) {
        console.warn('BLE 광고를 시작할 수 없습니다.');
      } else {
        console.log('블루투스 광고가 시작되었습니다.');
      }

      // 스캔 시작
      const scanSuccess = await bleService.startScanning();
      if (!scanSuccess) {
        console.warn('BLE 스캔을 시작할 수 없습니다.');
      } else {
        console.log(
          '블루투스 스캔이 시작되었습니다. 지속적으로 주변 기기를 탐색합니다.',
        );
      }
    } catch (error) {
      console.error('BLE 오류:', error);
    }
  };

  // 기기 선택 핸들러
  const handleDevicePress = (device: DiscoveredDevice) => {
    if (device.iBeaconData) {
      Alert.alert(
        '기기 정보',
        `ID: ${device.id}\nUUID: ${device.iBeaconData.uuid}\nMajor: ${device.iBeaconData.major}\nMinor: ${device.iBeaconData.minor}`,
        [{ text: '확인', style: 'default' }],
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <BluetoothRadar
          devices={discoveredDevices}
          isScanning={isScanning}
          myUUID={myUUID}
          onDevicePress={handleDevicePress}
        />
      </View>
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
