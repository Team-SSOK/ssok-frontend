import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
// @ts-ignore
import BleAdvertise from 'react-native-ble-advertise';
import { generateUUID } from '@/utils/ble';

// 광고 상태 타입 정의
type AdvertiserState = {
  isAdvertising: boolean;
  uuid: string;
  major: number;
  minor: number;
  error: string | null;
};

/**
 * BLE 광고 기능을 위한 커스텀 훅
 * Peripheral 모드로 작동하여 iBeacon 포맷으로 광고 데이터를 브로드캐스트
 */
export const useBleAdvertiser = () => {
  // 광고 상태 관리
  const [state, setState] = useState<AdvertiserState>({
    isAdvertising: false,
    uuid: '',
    major: 0,
    minor: 0,
    error: null,
  });

  // 컴포넌트 마운트 시 광고 모듈 초기화
  useEffect(() => {
    // 플랫폼 확인 (Android만 지원)
    if (Platform.OS !== 'android') {
      setState((prev) => ({
        ...prev,
        error: 'BLE 광고는 Android 기기에서만 지원됩니다.',
      }));
      return;
    }

    try {
      // 로그 활성화 및 회사 ID 설정
      BleAdvertise.setCompanyId(0x00e0); // 사용자 지정 회사 ID
      console.log('[BLE Advertiser] 초기화 완료');
    } catch (error) {
      console.error('[BLE Advertiser] 초기화 오류:', error);
      setState((prev) => ({
        ...prev,
        error: '광고 모듈 초기화에 실패했습니다.',
      }));
    }

    // 컴포넌트 언마운트 시 광고 중지
    return () => {
      if (state.isAdvertising) {
        stopAdvertising();
      }
    };
  }, []);

  /**
   * BLE 광고 시작 함수
   *
   * @param uuid - 사용할 UUID, 없으면 자동 생성
   * @param major - Major 값 (기본값: 1)
   * @param minor - Minor 값 (기본값: 1)
   * @returns 성공 여부
   */
  const startAdvertising = async (
    uuid?: string,
    major: number = 1,
    minor: number = 1,
  ): Promise<boolean> => {
    // Android 플랫폼 확인
    if (Platform.OS !== 'android') {
      setState((prev) => ({
        ...prev,
        error: 'BLE 광고는 Android 기기에서만 지원됩니다.',
      }));
      return false;
    }

    try {
      // UUID 설정 (없으면 자동 생성)
      const beaconUuid = uuid || generateUUID();

      console.log('[BLE Advertiser] 광고 시작:', {
        uuid: beaconUuid,
        major,
        minor,
      });

      // BLE 광고 시작
      await BleAdvertise.broadcast(beaconUuid, major, minor);

      // 상태 업데이트
      setState({
        isAdvertising: true,
        uuid: beaconUuid,
        major,
        minor,
        error: null,
      });

      console.log('[BLE Advertiser] 광고 시작 성공');
      return true;
    } catch (error) {
      console.error('[BLE Advertiser] 광고 시작 오류:', error);
      setState((prev) => ({
        ...prev,
        isAdvertising: false,
        error: '광고 시작에 실패했습니다.',
      }));
      return false;
    }
  };

  /**
   * BLE 광고 중지 함수
   *
   * @returns 성공 여부
   */
  const stopAdvertising = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      console.log('[BLE Advertiser] 광고 중지 시도');
      await BleAdvertise.stopBroadcast();

      // 상태 업데이트
      setState((prev) => ({
        ...prev,
        isAdvertising: false,
      }));

      console.log('[BLE Advertiser] 광고 중지 완료');
      return true;
    } catch (error) {
      console.error('[BLE Advertiser] 광고 중지 오류:', error);
      setState((prev) => ({
        ...prev,
        error: '광고 중지에 실패했습니다.',
      }));
      return false;
    }
  };

  // 현재 광고 상태 및 제어 함수 반환
  return {
    ...state,
    startAdvertising,
    stopAdvertising,
  };
};
