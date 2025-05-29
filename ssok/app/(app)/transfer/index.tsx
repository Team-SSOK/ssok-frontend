import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import TransferFlow from '@/modules/transfer/components/TransferFlow';
import { TransferStep } from '@/modules/transfer/types/transferFlow';
import { banks } from '@/mocks/bankData';

/**
 * 송금 메인 페이지
 * 모든 송금 스텝을 하나의 플로우로 관리합니다
 */
export default function TransferScreen() {
  const { accountId, userId, userName, bankName, isBluetooth } =
    useLocalSearchParams();

  // 블루투스 송금인 경우 초기 데이터와 스텝 설정
  const initialStep: TransferStep =
    isBluetooth === 'true' ? 'amount' : 'account';

  let initialData = {};
  if (isBluetooth === 'true') {
    // 은행 이름으로 은행 정보 찾기
    const selectedBank =
      banks.find((bank) => bank.name === bankName) || banks[0];

    initialData = {
      userId: userId as string,
      userName: userName as string,
      selectedBank: selectedBank,
      isBluetoothTransfer: true,
    };
  }

  return (
    <TransferFlow
      sourceAccountId={accountId as string}
      initialStep={initialStep}
      initialData={initialData}
    />
  );
}
