import { useState, useCallback } from 'react';

/**
 * 로딩 상태를 관리하는 간단한 훅
 * @returns 로딩 상태와 상태 변경 함수들
 *
 * @example
 * ```tsx
 * const { isLoading, startLoading, stopLoading, withLoading } = useLoadingSpinner();
 *
 * // 방법 1: 직접 로딩 상태 제어
 * const handleSubmit = async () => {
 *   startLoading();
 *   try {
 *     await someAsyncFunction();
 *   } finally {
 *     stopLoading();
 *   }
 * }
 *
 * // 방법 2: withLoading 함수 사용
 * const handleFetch = withLoading(async () => {
 *   await fetchData();
 * });
 *
 * return (
 *   <>
 *     {isLoading && <LoadingIndicator visible={true} />}
 *     <Button onPress={handleFetch}>데이터 가져오기</Button>
 *   </>
 * );
 * ```
 */
const useLoadingSpinner = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  /**
   * 비동기 함수 실행 중 자동으로 로딩 상태를 관리하는 래퍼 함수
   */
  const withLoading = useCallback(
    <T extends any[], R>(asyncFn: (...args: T) => Promise<R>) => {
      return async (...args: T) => {
        startLoading();
        try {
          return await asyncFn(...args);
        } finally {
          stopLoading();
        }
      };
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

export default useLoadingSpinner;
