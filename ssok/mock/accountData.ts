export interface AccountData {
  accountID: number;
  accountNumber: string;
  bankCode: number; // 쏙뱅크
  createdAt: string;
  updatedAt: string;
  isPrimaryAccount: boolean;
  accountAlias: string;
  userId: number;
  accountTypeCode: number; // 예금
}

export const mockAccount: AccountData = {
  accountID: 10001,
  accountNumber: '110-345-678901',
  bankCode: 1, // 쏙뱅크
  createdAt: '2025-04-25T10:00:00Z',
  updatedAt: '2025-04-25T10:00:00Z',
  isPrimaryAccount: true,
  accountAlias: '생활비 계좌',
  userId: 20001,
  accountTypeCode: 1, // 예금
};

// 뱅크 코드에 따른 은행 이름
export const getBankName = (bankCode: number): string => {
  const banks: Record<number, string> = {
    1: 'SSOK 뱅크',
    2: '신한은행',
    3: '국민은행',
    4: '우리은행',
    5: '하나은행',
  };

  return banks[bankCode] || '기타 은행';
};

// 계좌 타입 코드에 따른 계좌 종류
export const getAccountType = (accountTypeCode: number): string => {
  const accountTypes: Record<number, string> = {
    1: '예금',
    2: '적금',
    3: '청약',
    4: '대출',
  };

  return accountTypes[accountTypeCode] || '기타';
};

// 계좌 잔액 (실제로는 API로 가져올 데이터)
export const getAccountBalance = (): number => {
  return 1258000; // 1,258,000원
};
