import { Bank } from '@/mocks/bankData';

/**
 * 송금 플로우 스텝 타입
 */
export type TransferStep = 'account' | 'amount' | 'complete';

/**
 * 송금 플로우 데이터 타입
 */
export interface TransferFlowData {
  // 계좌 정보 스텝
  accountNumber?: string;
  selectedBank?: Bank;
  userName?: string;
  uuid?: string;

  // 금액 스텝
  amount?: number;

  // 확인 스텝
  isConfirmed?: boolean;

  // 블루투스 송금 관련
  userId?: string;
  isBluetoothTransfer?: boolean;

  // 완료 스텝
  isCompleted?: boolean;
  transferResult?: any;
}

/**
 * 스텝 컴포넌트 공통 Props
 */
export interface StepComponentProps {
  data: TransferFlowData;
  onNext: (updates: Partial<TransferFlowData>) => void;
  onBack?: () => void;
  onAmountChange?: (amount: number) => void;
}

/**
 * 송금 플로우 상태
 */
export interface TransferFlowState {
  currentStep: TransferStep;
  data: TransferFlowData;
  isLoading: boolean;
  error: string | null;
}
