/**
 * 거래 내역 데이터 타입
 */
export interface Transaction {
  transferID: number;
  accountId: number;
  counterpartAccount: string;
  counterpartName: string;
  transferType: 'DEPOSIT' | 'WITHDRAW';
  transferMoney: number;
  currencyCode: number;
  transferMethod: number;
  createdAt: string;
  balanceAfterTransaction: number;
}
