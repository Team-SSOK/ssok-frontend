import { create } from 'zustand';

/**
 * 전역 로딩 상태 관리를 위한 Store 인터페이스
 */
interface LoadingState {
  // 상태
  isLoading: boolean;
  loadingMessage?: string;
  loadingStack: number;

  // 액션
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  resetLoading: () => void;
  withLoading: <T>(
    asyncFunction: () => Promise<T>,
    message?: string,
  ) => Promise<T>;
}

/**
 * 전역 로딩 상태 관리 Store
 *
 * 여러 컴포넌트에서 로딩 상태를 공유하고 관리하기 위한 Zustand 스토어
 *
 * @example
 * ```ts
 * const { isLoading, startLoading, stopLoading, withLoading } = useLoadingStore();
 *
 * // 방법 1: 수동으로 로딩 상태 관리
 * startLoading('데이터 로딩 중...');
 * try {
 *   await fetchData();
 * } finally {
 *   stopLoading();
 * }
 *
 * // 방법 2: withLoading 유틸리티 사용 (권장)
 * await withLoading(async () => {
 *   await fetchData();
 * }, '데이터 로딩 중...');
 * ```
 */
export const useLoadingStore = create<LoadingState>((set, get) => ({
  // 초기 상태
  isLoading: false,
  loadingMessage: undefined,
  loadingStack: 0,

  // 액션
  startLoading: (message?: string) =>
    set((state) => ({
      isLoading: true,
      loadingMessage: message || state.loadingMessage,
      loadingStack: state.loadingStack + 1,
    })),

  stopLoading: () =>
    set((state) => {
      const newStack = Math.max(0, state.loadingStack - 1);
      return {
        isLoading: newStack > 0,
        loadingStack: newStack,
        loadingMessage: newStack > 0 ? state.loadingMessage : undefined,
      };
    }),

  resetLoading: () =>
    set({
      isLoading: false,
      loadingMessage: undefined,
      loadingStack: 0,
    }),

  /**
   * 비동기 함수 실행 중에 로딩 상태를 자동으로 관리
   * @param asyncFunction 실행할 비동기 함수
   * @param message 선택적 로딩 메시지
   * @returns 비동기 함수의 결과
   */
  withLoading: async <T>(
    asyncFunction: () => Promise<T>,
    message?: string,
  ): Promise<T> => {
    const { startLoading, stopLoading } = get();
    try {
      startLoading(message);
      return await asyncFunction();
    } finally {
      stopLoading();
    }
  },
}));
