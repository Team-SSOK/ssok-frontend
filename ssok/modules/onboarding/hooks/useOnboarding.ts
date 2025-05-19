import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@ssok:onboarding_completed';

type AsyncStorageOperationResult = {
  success: boolean;
  error?: Error;
};

/**
 * Onboarding 관련 상태와 기능을 관리하는 훅
 */
export const useOnboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  /**
   * 다음 슬라이드로 이동
   */
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => prev + 1);
  }, []);

  /**
   * 이전 슬라이드로 이동
   */
  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * 특정 슬라이드로 이동
   */
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  /**
   * AsyncStorage 작업을 안전하게 처리하는 헬퍼 함수
   */
  const safeStorageOperation = async (
    operation: () => Promise<void>,
  ): Promise<AsyncStorageOperationResult> => {
    try {
      await operation();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  };

  /**
   * Onboarding 완료 상태 저장
   */
  const completeOnboarding =
    useCallback(async (): Promise<AsyncStorageOperationResult> => {
      setIsLoading(true);

      const result = await safeStorageOperation(async () => {
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        setIsCompleted(true);
      });

      setIsLoading(false);
      return result;
    }, []);

  /**
   * Onboarding 완료 여부 확인
   */
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const status = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      const completed = status === 'true';
      setIsCompleted(completed);
      return completed;
    } catch (error) {
      console.error('Onboarding 상태 확인 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Onboarding 상태 초기화 (테스트용)
   */
  const resetOnboardingStatus =
    useCallback(async (): Promise<AsyncStorageOperationResult> => {
      setIsLoading(true);

      const result = await safeStorageOperation(async () => {
        await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        setIsCompleted(false);
      });

      setIsLoading(false);
      return result;
    }, []);

  // 컴포넌트 마운트 시 온보딩 상태 확인
  useEffect(() => {
    checkOnboardingStatus().catch((error) => {
      console.error('초기 온보딩 상태 확인 중 오류 발생:', error);
    });
  }, [checkOnboardingStatus]);

  return {
    currentSlide,
    isLoading,
    isCompleted,
    goToNextSlide,
    goToPrevSlide,
    goToSlide,
    completeOnboarding,
    checkOnboardingStatus,
    resetOnboardingStatus,
  };
};

export default useOnboarding;
