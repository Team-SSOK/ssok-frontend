import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import TransferFlow from '@/modules/transfer/components/TransferFlow';

/**
 * 송금 메인 페이지
 * 모든 송금 스텝을 하나의 플로우로 관리합니다
 */
export default function TransferScreen() {
  const { accountId } = useLocalSearchParams();

  return <TransferFlow sourceAccountId={accountId as string} />;
}
