// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { STORAGE_KEYS } from './constants';

// /**
//  * API 응답에서 받은 토큰 저장
//  */
// export const saveAuthTokens = async (
//   accessToken: string,
//   refreshToken: string,
// ): Promise<void> => {
//   try {
//     await Promise.all([
//       AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
//       AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
//     ]);
//     console.log('[LOG] 인증 토큰 저장 완료');
//   } catch (error) {
//     console.error('인증 토큰 저장 중 오류 발생:', error);
//     throw new Error('인증 토큰 저장에 실패했습니다.');
//   }
// };

// /**
//  * 저장된 토큰 가져오기
//  */
// export const getAuthTokens = async (): Promise<{
//   accessToken: string | null;
//   refreshToken: string | null;
// }> => {
//   try {
//     const [accessToken, refreshToken] = await Promise.all([
//       AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
//       AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
//     ]);
//     return { accessToken, refreshToken };
//   } catch (error) {
//     console.error('인증 토큰 조회 중 오류 발생:', error);
//     return { accessToken: null, refreshToken: null };
//   }
// };

// /**
//  * 인증 토큰 삭제 (로그아웃)
//  */
// export const clearAuthTokens = async (): Promise<void> => {
//   try {
//     await Promise.all([
//       AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
//       AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
//     ]);
//     console.log('[LOG] 인증 토큰 삭제 완료');
//   } catch (error) {
//     console.error('인증 토큰 삭제 중 오류 발생:', error);
//     throw new Error('인증 토큰 삭제에 실패했습니다.');
//   }
// };

// /**
//  * 사용자 ID 조회
//  */
// export const getUserId = async (): Promise<number | null> => {
//   try {
//     const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
//     return userId ? parseInt(userId, 10) : null;
//   } catch (error) {
//     console.error('사용자 ID 조회 중 오류 발생:', error);
//     return null;
//   }
// };

// /**
//  * 로그인 상태 확인
//  */
// export const isLoggedIn = async (): Promise<boolean> => {
//   try {
//     const { accessToken } = await getAuthTokens();
//     const userId = await getUserId();
//     return !!(accessToken && userId);
//   } catch (error) {
//     console.error('로그인 상태 확인 중 오류 발생:', error);
//     return false;
//   }
// };
