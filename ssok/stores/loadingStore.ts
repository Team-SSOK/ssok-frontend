import { create } from 'zustand';

interface LoadingState {
  // 상태
  isLoading: boolean;

  // 액션
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFunction: () => Promise<T>) => Promise<T>;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  // 초기 상태
  isLoading: false,

  // 액션
  startLoading: () => set({ isLoading: true }),

  stopLoading: () => set({ isLoading: false }),

  withLoading: async <T>(asyncFunction: () => Promise<T>): Promise<T> => {
    try {
      get().startLoading();
      return await asyncFunction();
    } finally {
      get().stopLoading();
    }
  },
}));
