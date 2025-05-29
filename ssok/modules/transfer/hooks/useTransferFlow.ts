import { useState, useCallback } from 'react';
import {
  TransferStep,
  TransferFlowData,
  TransferFlowState,
} from '../types/transferFlow';
import {
  createStepTransition,
  createTextFadeTransition,
} from '../utils/animations';

/**
 * 송금 플로우 관리 훅
 * 스텝 네비게이션과 데이터 상태를 관리합니다
 */
export const useTransferFlow = (initialStep: TransferStep = 'account') => {
  const [state, setState] = useState<TransferFlowState>({
    currentStep: initialStep,
    data: {},
    isLoading: false,
    error: null,
  });

  /**
   * 다음 스텝으로 이동
   */
  const goToNext = useCallback((updates: Partial<TransferFlowData> = {}) => {
    // 애니메이션 트리거
    createStepTransition();

    setState((prevState) => {
      const newData = { ...prevState.data, ...updates };
      let nextStep: TransferStep = prevState.currentStep;

      // 스텝 순서 결정
      switch (prevState.currentStep) {
        case 'account':
          nextStep = 'amount';
          break;
        case 'amount':
          nextStep = 'confirm';
          break;
        case 'confirm':
          nextStep = 'complete';
          break;
        case 'complete':
          // 완료 상태에서는 더 이상 진행하지 않음
          break;
      }

      return {
        ...prevState,
        currentStep: nextStep,
        data: newData,
        error: null,
      };
    });
  }, []);

  /**
   * 이전 스텝으로 이동
   */
  const goToPrevious = useCallback(() => {
    console.log('goToPrevious called');

    // 애니메이션 트리거
    createStepTransition();

    setState((prevState) => {
      console.log('Current state in goToPrevious:', prevState.currentStep);
      let previousStep: TransferStep = prevState.currentStep;

      // 이전 스텝 결정
      switch (prevState.currentStep) {
        case 'amount':
          previousStep = 'account';
          console.log('Moving from amount to account');
          break;
        case 'confirm':
          previousStep = 'amount';
          console.log('Moving from confirm to amount');
          break;
        case 'complete':
          previousStep = 'confirm';
          console.log('Moving from complete to confirm');
          break;
        case 'account':
          console.log('Already at account step, not moving');
          // 첫 번째 스텝에서는 더 이상 뒤로 가지 않음
          break;
      }

      console.log('New step will be:', previousStep);

      return {
        ...prevState,
        currentStep: previousStep,
        error: null,
      };
    });
  }, []);

  /**
   * 특정 스텝으로 직접 이동
   */
  const goToStep = useCallback(
    (step: TransferStep, updates: Partial<TransferFlowData> = {}) => {
      createStepTransition();

      setState((prevState) => ({
        ...prevState,
        currentStep: step,
        data: { ...prevState.data, ...updates },
        error: null,
      }));
    },
    [],
  );

  /**
   * 데이터 업데이트 (스텝 이동 없이)
   */
  const updateData = useCallback((updates: Partial<TransferFlowData>) => {
    setState((prevState) => ({
      ...prevState,
      data: { ...prevState.data, ...updates },
    }));
  }, []);

  /**
   * 로딩 상태 설정
   */
  const setLoading = useCallback((loading: boolean) => {
    setState((prevState) => ({
      ...prevState,
      isLoading: loading,
    }));
  }, []);

  /**
   * 에러 상태 설정
   */
  const setError = useCallback((error: string | null) => {
    setState((prevState) => ({
      ...prevState,
      error,
    }));
  }, []);

  /**
   * 플로우 초기화
   */
  const reset = useCallback(() => {
    createStepTransition();
    setState({
      currentStep: initialStep,
      data: {},
      isLoading: false,
      error: null,
    });
  }, [initialStep]);

  return {
    // 상태
    currentStep: state.currentStep,
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,

    // 액션
    goToNext,
    goToPrevious,
    goToStep,
    updateData,
    setLoading,
    setError,
    reset,
  };
};
