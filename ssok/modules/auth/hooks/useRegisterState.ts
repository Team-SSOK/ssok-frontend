import { useReducer, useCallback } from 'react';
import { ACTION_TYPES } from '../utils/constants';

// 상태 인터페이스
export interface RegisterState {
  // 로딩 상태
  loading: {
    sendingCode: boolean;
    verifyingCode: boolean;
    registering: boolean;
  };
  // 인증 상태
  verificationSent: boolean;
  verificationConfirmed: boolean;
}

// 액션 타입 정의
type LoadingKey = keyof RegisterState['loading'];

// 구체적인 액션 타입 정의
type StartLoadingAction = {
  type: typeof ACTION_TYPES.START_LOADING;
  payload: LoadingKey;
};
type StopLoadingAction = {
  type: typeof ACTION_TYPES.STOP_LOADING;
  payload: LoadingKey;
};
type SetVerificationSentAction = {
  type: typeof ACTION_TYPES.SET_VERIFICATION_SENT;
  payload: boolean;
};
type SetVerificationConfirmedAction = {
  type: typeof ACTION_TYPES.SET_VERIFICATION_CONFIRMED;
  payload: boolean;
};
type ResetAction = { type: typeof ACTION_TYPES.RESET };

type Action =
  | StartLoadingAction
  | StopLoadingAction
  | SetVerificationSentAction
  | SetVerificationConfirmedAction
  | ResetAction;

// 초기 상태
const initialState: RegisterState = {
  loading: {
    sendingCode: false,
    verifyingCode: false,
    registering: false,
  },
  verificationSent: false,
  verificationConfirmed: false,
};

// 리듀서 함수
const reducer = (state: RegisterState, action: Action): RegisterState => {
  switch (action.type) {
    case ACTION_TYPES.START_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [(action as StartLoadingAction).payload]: true,
        },
      };
    case ACTION_TYPES.STOP_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [(action as StopLoadingAction).payload]: false,
        },
      };
    case ACTION_TYPES.SET_VERIFICATION_SENT:
      return {
        ...state,
        verificationSent: (action as SetVerificationSentAction).payload,
      };
    case ACTION_TYPES.SET_VERIFICATION_CONFIRMED:
      return {
        ...state,
        verificationConfirmed: (action as SetVerificationConfirmedAction)
          .payload,
      };
    case ACTION_TYPES.RESET:
      return initialState;
    default:
      return state;
  }
};

/**
 * 회원가입 화면의 상태 관리를 위한 훅
 */
export const useRegisterState = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 액션 디스패처 함수들
  const startLoading = (key: LoadingKey) => {
    dispatch({ type: ACTION_TYPES.START_LOADING, payload: key });
  };

  const stopLoading = (key: LoadingKey) => {
    dispatch({ type: ACTION_TYPES.STOP_LOADING, payload: key });
  };

  const setVerificationSent = (value: boolean) => {
    dispatch({ type: ACTION_TYPES.SET_VERIFICATION_SENT, payload: value });
  };

  const setVerificationConfirmed = (value: boolean) => {
    dispatch({ type: ACTION_TYPES.SET_VERIFICATION_CONFIRMED, payload: value });
  };

  const reset = () => {
    dispatch({ type: ACTION_TYPES.RESET });
  };

  // 비동기 작업을 실행하면서 로딩 상태를 관리하는 함수
  const withLoading = useCallback(
    <T extends any[], R>(
      key: LoadingKey,
      asyncFn: (...args: T) => Promise<R>,
    ) => {
      return async (...args: T): Promise<R> => {
        startLoading(key);
        try {
          return await asyncFn(...args);
        } finally {
          stopLoading(key);
        }
      };
    },
    [startLoading, stopLoading],
  );

  return {
    state,
    startLoading,
    stopLoading,
    setVerificationSent,
    setVerificationConfirmed,
    reset,
    withLoading,
  };
};

export default useRegisterState;
