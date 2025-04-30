import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import BleStatusCard from '@/modules/bluetooth/components/BleStatusCard';
import PeerDeviceList from '@/modules/bluetooth/components/PeerDeviceList';
import bleService from '@/modules/bluetooth/services/bleService';
import { DiscoveredDevice } from '@/hooks/useBleScanner';
import { generateUUID } from '@/utils/ble';

const BluetoothScreen: React.FC = () => {
  // 블루투스 상태
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [myUUID, setMyUUID] = useState<string>(generateUUID());
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDevice[]
  >([]);

  // BLE 서비스 초기화
  useEffect(() => {
    const initService = async () => {
      const initialized = await bleService.initialize({
        advertisingUUID: myUUID,
        autoStart: false,
      });

      if (initialized) {
        // UUID 업데이트
        setMyUUID(bleService.getMyUUID());
      }
    };

    initService();

    // BLE 서비스 이벤트 리스너 등록
    const removeListener = bleService.addListener({
      onPeerDiscovered: (device) => {
        setDiscoveredDevices((prev) => {
          // 이미 있는 기기인지 확인
          const exists = prev.some((d) => d.id === device.id);
          if (exists) {
            // 기존 기기 업데이트
            return prev.map((d) => (d.id === device.id ? device : d));
          }
          // 새 기기 추가
          return [...prev, device];
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

  // 광고 시작 핸들러
  const handleStartAdvertising = async () => {
    const success = await bleService.startAdvertising();
    if (!success) {
      Alert.alert('오류', 'BLE 광고를 시작할 수 없습니다.');
    }
  };

  // 광고 중지 핸들러
  const handleStopAdvertising = async () => {
    await bleService.stopAdvertising();
  };

  // 스캔 시작 핸들러
  const handleStartScanning = async () => {
    // 기존 발견 목록 초기화
    setDiscoveredDevices([]);

    const success = await bleService.startScanning();
    if (!success) {
      Alert.alert('오류', 'BLE 스캔을 시작할 수 없습니다.');
    }
  };

  // 스캔 중지 핸들러
  const handleStopScanning = async () => {
    await bleService.stopScanning();
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
        <View style={styles.statusCardContainer}>
          <BleStatusCard
            isAdvertising={isAdvertising}
            isScanning={isScanning}
            uuid={myUUID}
            onStartAdvertising={handleStartAdvertising}
            onStopAdvertising={handleStopAdvertising}
            onStartScanning={handleStartScanning}
            onStopScanning={handleStopScanning}
          />
        </View>

        <View style={styles.listContainer}>
          <PeerDeviceList
            devices={discoveredDevices}
            isScanning={isScanning}
            onDevicePress={handleDevicePress}
          />
        </View>
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
    display: 'flex',
    flexDirection: 'column',
  },
  statusCardContainer: {
    paddingVertical: 8,
  },
  listContainer: {
    flex: 1,
  },
});

export default BluetoothScreen;
