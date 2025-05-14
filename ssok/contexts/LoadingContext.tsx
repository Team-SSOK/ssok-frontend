import React, { createContext, useContext, ReactNode } from 'react';
import useLoading from '@/hooks/useLoading';
import LoadingIndicator from '@/components/LoadingIndicator';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFunction: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * 앱 전체에서 로딩 상태를 관리하는 Provider 컴포넌트
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading();

  return (
    <LoadingContext.Provider
      value={{ isLoading, startLoading, stopLoading, withLoading }}
    >
      {children}
      <LoadingIndicator visible={isLoading} />
    </LoadingContext.Provider>
  );
};

/**
 * 로딩 상태와 관련된 함수들을 제공하는 커스텀 훅
 */
export const useAppLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useAppLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingProvider;
