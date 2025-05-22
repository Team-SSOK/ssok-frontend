import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { notificationApi } from '../api/notificationApi';
import { useAuthStore } from '@/modules/auth/store/authStore';
import Constants from 'expo-constants';

// FCM 토큰 저장 키
const FCM_TOKEN_KEY = 'fcm_token';
// FCM 토큰 발급일 저장 키 (유효기간 체크용)
const FCM_TOKEN_DATE_KEY = 'fcm_token_date';
// FCM 토큰 유효기간 (30일)
const FCM_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30일

// 프로젝트 ID (app.json에서 가져옴)
const PROJECT_ID =
  Constants.expoConfig?.extra?.eas?.projectId ||
  '2a3b5cd9-08b6-4936-adb8-92dd3c4005cd';

/**
 * 푸시 알림 설정 및 FCM 토큰 관리를 위한 커스텀 훅
 * @returns 푸시 알림 관련 함수 및 상태
 */
export const usePushNotification = () => {
  const [devicePushToken, setDevicePushToken] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, userId } = useAuthStore();

  /**
   * 알림 권한 요청 함수
   * @returns 권한 부여 여부
   */
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      setError('실제 기기에서만 푸시 알림을 사용할 수 있습니다.');
      return false;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 권한이 아직 없으면 요청
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('푸시 알림 권한이 거부되었습니다.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('알림 권한 요청 오류:', err);
      setError('알림 권한 요청 중 오류가 발생했습니다.');
      return false;
    }
  };

  /**
   * 기기 푸시 토큰 발급 및 저장 함수
   * @returns 네이티브 디바이스 푸시 토큰
   */
  const getAndSaveDevicePushToken = async (): Promise<string | null> => {
    try {
      // 현재 저장된 토큰과 발급일 확인
      const savedToken = await SecureStore.getItemAsync(FCM_TOKEN_KEY);
      const savedTokenDate = await SecureStore.getItemAsync(FCM_TOKEN_DATE_KEY);

      // 저장된 토큰이 있고 유효기간(30일) 내인 경우 재사용
      if (savedToken && savedTokenDate) {
        const tokenDate = new Date(savedTokenDate).getTime();
        const now = new Date().getTime();

        if (now - tokenDate < FCM_TOKEN_TTL) {
          console.log('기존 디바이스 푸시 토큰 사용:', savedToken);
          setDevicePushToken(savedToken);
          return savedToken;
        }
      }

      // 새 토큰 발급
      console.log('새로운 디바이스 푸시 토큰 발급 시작...');

      const deviceToken = await Notifications.getDevicePushTokenAsync();

      console.log('========== 디바이스 푸시 토큰 정보 ==========');
      console.log(
        '디바이스 토큰 전체 객체:',
        JSON.stringify(deviceToken, null, 2),
      );

      let tokenValue = '';

      // deviceToken의 타입에 따라 데이터 추출 방식이 다를 수 있음
      if (Platform.OS === 'ios') {
        // iOS에서는 토큰이 문자열 형태로 제공됨
        tokenValue = deviceToken.data;
      } else {
        // Android에서는 FCM 토큰 문자열로 제공됨
        tokenValue = deviceToken.data;
      }

      console.log('디바이스 푸시 토큰 값:', tokenValue);
      console.log('토큰 타입:', typeof tokenValue);
      console.log('플랫폼:', Platform.OS);
      console.log('====================================');

      setDevicePushToken(tokenValue);

      // 토큰과 발급일 저장
      await SecureStore.setItemAsync(FCM_TOKEN_KEY, tokenValue);
      await SecureStore.setItemAsync(
        FCM_TOKEN_DATE_KEY,
        new Date().toISOString(),
      );

      console.log('디바이스 푸시 토큰 저장 완료:', tokenValue);
      return tokenValue;
    } catch (err) {
      console.error('디바이스 푸시 토큰 발급 오류:', err);
      setError('디바이스 푸시 토큰 발급 중 오류가 발생했습니다.');
      return null;
    }
  };

  /**
   * 백엔드에 푸시 토큰 등록 함수
   * @param token 디바이스 푸시 토큰
   */
  const registerPushTokenToServer = async (token: string): Promise<boolean> => {
    try {
      console.log('서버에 디바이스 푸시 토큰 등록 요청:', token);
      const response = await notificationApi.registerFcmToken(token);

      if (response.data.isSuccess) {
        console.log('디바이스 푸시 토큰 서버 등록 성공:', response.data);
        setIsRegistered(true);
        return true;
      } else {
        console.error('디바이스 푸시 토큰 서버 등록 실패:', response.data);
        setError(`디바이스 푸시 토큰 등록 실패: ${response.data.message}`);
        return false;
      }
    } catch (err) {
      console.error('디바이스 푸시 토큰 서버 등록 오류:', err);
      setError('디바이스 푸시 토큰 서버 등록 중 오류가 발생했습니다.');
      return false;
    }
  };

  /**
   * 푸시 알림 초기화 함수
   */
  const initPushNotifications = async (): Promise<void> => {
    try {
      console.log('푸시 알림 초기화 시작...');

      // 알림 권한 요청
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.log('알림 권한 없음, 초기화 중단');
        return;
      }

      // 알림 핸들러 설정
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // 디바이스 푸시 토큰 발급 및 저장
      const token = await getAndSaveDevicePushToken();
      if (!token) {
        console.log('디바이스 푸시 토큰 발급 실패, 초기화 중단');
        return;
      }

      // 서버에 토큰 등록 (로그인 상태인 경우)
      if (isLoggedIn && userId) {
        console.log('로그인 상태, 서버에 디바이스 푸시 토큰 등록 시도');
        await registerPushTokenToServer(token);
      } else {
        console.log('로그인되지 않음, 서버 등록 생략');
      }

      console.log('푸시 알림 초기화 완료');
    } catch (err) {
      console.error('푸시 알림 초기화 오류:', err);
      setError('푸시 알림 초기화 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 마운트 시 푸시 알림 초기화
  useEffect(() => {
    // 앱이 포그라운드에 있을 때 알림을 받으면 알림 배너 표시
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  // 로그인 상태 변경 시 푸시 토큰 등록 처리
  useEffect(() => {
    if (isLoggedIn && userId && devicePushToken) {
      console.log('로그인 상태 변경 감지, 디바이스 푸시 토큰 등록 시도', {
        userId,
        devicePushToken,
      });
      registerPushTokenToServer(devicePushToken);
    }
  }, [isLoggedIn, userId, devicePushToken]);

  return {
    devicePushToken,
    isRegistered,
    error,
    initPushNotifications,
    registerPushTokenToServer,
  };
};
