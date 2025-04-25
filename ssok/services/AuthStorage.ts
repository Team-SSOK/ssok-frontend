import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PHONE_NUMBER: '@ssok:phone_number',
  PIN: '@ssok:pin',
  IS_REGISTERED: '@ssok:is_registered',
};

export const AuthStorage = {
  /**
   * 사용자 등록 정보 저장
   */
  saveUserInfo: async (phoneNumber: string, pin: string): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phoneNumber),
        AsyncStorage.setItem(STORAGE_KEYS.PIN, pin),
        AsyncStorage.setItem(STORAGE_KEYS.IS_REGISTERED, 'true'),
      ]);
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  },

  /**
   * 사용자 등록 여부 확인
   */
  isUserRegistered: async (): Promise<boolean> => {
    try {
      const isRegistered = await AsyncStorage.getItem(
        STORAGE_KEYS.IS_REGISTERED,
      );
      console.log('[LOG] isRegistered: ', isRegistered);
      return isRegistered === 'true';
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  },

  /**
   * PIN 번호 검증
   */
  verifyPin: async (inputPin: string): Promise<boolean> => {
    try {
      const storedPin = await AsyncStorage.getItem(STORAGE_KEYS.PIN);
      console.log('[LOG] storedPin: ', storedPin);
      return storedPin === inputPin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  },

  /**
   * 저장된 전화번호 가져오기
   */
  getPhoneNumber: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER);
    } catch (error) {
      console.error('Error getting phone number:', error);
      return null;
    }
  },

  /**
   * 로그아웃 (모든 사용자 데이터 삭제)
   */
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PHONE_NUMBER,
        STORAGE_KEYS.PIN,
        STORAGE_KEYS.IS_REGISTERED,
      ]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
};

export default AuthStorage;
