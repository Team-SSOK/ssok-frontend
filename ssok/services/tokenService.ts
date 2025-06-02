import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const LOG_TAG = '[TokenService]';

/**
 * SecureStore 기본 작업 - 에러 처리 통일
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'SecureStore 읽기 오류',
      text2: '저장된 데이터를 읽는 중 오류가 발생했습니다.',
      position: 'bottom',
    });
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'SecureStore 저장 오류',
      text2: '데이터 저장 중 오류가 발생했습니다.',
      position: 'bottom',
    });
    return false;
  }
}

export async function removeItem(key: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'SecureStore 삭제 오류',
      text2: '데이터 삭제 중 오류가 발생했습니다.',
      position: 'bottom',
    });
    return false;
  }
}

/**
 * 토큰 관련 고수준 API
 */
export async function getTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    getItem(ACCESS_TOKEN_KEY),
    getItem(REFRESH_TOKEN_KEY),
  ]);

  return { accessToken, refreshToken };
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
): Promise<boolean> {
  const [accessResult, refreshResult] = await Promise.all([
    setItem(ACCESS_TOKEN_KEY, accessToken),
    setItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);

  const success = accessResult && refreshResult;

  return success;
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeItem(ACCESS_TOKEN_KEY),
    removeItem(REFRESH_TOKEN_KEY),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function hasValidTokens(): Promise<boolean> {
  const { accessToken, refreshToken } = await getTokens();
  return !!(accessToken && refreshToken);
}
