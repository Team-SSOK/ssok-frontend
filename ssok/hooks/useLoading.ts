import { useState, useCallback } from 'react';

/**
 * 로딩 상태를 관리하는 커스텀 훅
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState<boolean>(initialState);

  /**
   * 로딩 상태를 시작합니다
   */
  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  /**
   * 로딩 상태를 종료합니다
   */
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  /**
   * 비동기 함수를 실행하는 동안 로딩 상태를 관리합니다
   * @param asyncFunction 실행할 비동기 함수
   * @returns 비동기 함수의 결과
   */
  const withLoading = useCallback(
    async <T>(asyncFunction: () => Promise<T>): Promise<T> => {
      try {
        startLoading();
        return await asyncFunction();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};

export default useLoading;
