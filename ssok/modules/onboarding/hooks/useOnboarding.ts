import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@ssok:onboarding_completed';

/**
 * Onboarding 관련 상태와 기능을 관리하는 훅
 */
export const useOnboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
   * Onboarding 완료 상태 저장
   */
  const completeOnboarding = useCallback(async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Onboarding 완료 상태 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Onboarding 완료 여부 확인
   */
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const status = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return status === 'true';
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
  const resetOnboardingStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    } catch (error) {
      console.error('Onboarding 상태 초기화 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentSlide,
    isLoading,
    goToNextSlide,
    goToPrevSlide,
    goToSlide,
    completeOnboarding,
    checkOnboardingStatus,
    resetOnboardingStatus,
  };
};

export default useOnboarding;
