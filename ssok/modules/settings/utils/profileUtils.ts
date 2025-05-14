import AsyncStorage from '@react-native-async-storage/async-storage';

// 스토리지 키 상수
export const PROFILE_STORAGE_KEYS = {
  PROFILE_IMAGE: 'profile_image',
  USERNAME: 'username',
  PHONE_NUMBER: 'phone_number',
};

/**
 * 프로필 이미지 URL 저장
 */
export const saveProfileImageUrl = async (imageUrl: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEYS.PROFILE_IMAGE, imageUrl);
  } catch (error) {
    console.error('Error saving profile image URL:', error);
    throw error;
  }
};

/**
 * 프로필 이미지 URL 조회
 */
export const getProfileImageUrl = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PROFILE_STORAGE_KEYS.PROFILE_IMAGE);
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return null;
  }
};

/**
 * 사용자 기본 정보 저장
 */
export const saveUserInfo = async (
  username: string,
  phoneNumber: string,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEYS.USERNAME, username);
    await AsyncStorage.setItem(PROFILE_STORAGE_KEYS.PHONE_NUMBER, phoneNumber);
  } catch (error) {
    console.error('Error saving user info:', error);
    throw error;
  }
};

/**
 * 사용자 이름 조회
 */
export const getUsername = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PROFILE_STORAGE_KEYS.USERNAME);
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
};

/**
 * 사용자 전화번호 조회
 */
export const getPhoneNumber = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PROFILE_STORAGE_KEYS.PHONE_NUMBER);
  } catch (error) {
    console.error('Error getting phone number:', error);
    return null;
  }
};
