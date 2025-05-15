import { useCallback } from 'react';
import TokenDiagnostics from '@/utils/tokenDiagnostics';

/**
 * 토큰 진단 및 관리 기능을 제공하는 훅
 */
export default function useTokenDiagnostics() {
  /**
   * 토큰 상태 진단 실행
   */
  const diagnoseTokens = useCallback(async () => {
    await TokenDiagnostics.diagnoseTokens();
  }, []);

  /**
   * 토큰 동기화 실행
   */
  const syncTokens = useCallback(async () => {
    await TokenDiagnostics.syncTokens();
  }, []);

  /**
   * 모든 토큰 초기화 실행
   */
  const resetAllTokens = useCallback(async () => {
    await TokenDiagnostics.resetAllTokenStorage();
  }, []);

  return {
    diagnoseTokens,
    syncTokens,
    resetAllTokens,
  };
}
