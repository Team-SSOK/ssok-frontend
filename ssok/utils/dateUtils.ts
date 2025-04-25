import { Transaction } from '@/utils/types';

/**
 * 현재 날짜로부터 지정된 일수 전의 날짜를 ISO 문자열로 반환합니다.
 * @param days 이전 일수
 * @returns ISO 형식의 날짜 문자열
 */
export const getDateBefore = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

/**
 * 지정된 기간에 해당하는 일수를 반환합니다.
 * @param period 기간 (1주일, 1개월, 3개월)
 * @returns 해당 기간의 일수
 */
export const getPeriodDays = (period: '1주일' | '1개월' | '3개월'): number => {
  switch (period) {
    case '1주일':
      return 7;
    case '1개월':
      return 30;
    case '3개월':
      return 90;
    default:
      return 7;
  }
};

/**
 * 현재 날짜로부터 지정된 기간 이전의 기준 날짜를 계산합니다.
 * @param period 기간 (1주일, 1개월, 3개월)
 * @returns 기준 날짜
 */
export const getCutoffDateByPeriod = (
  period: '1주일' | '1개월' | '3개월',
): Date => {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysToFilter = getPeriodDays(period);

  return new Date(now.getTime() - daysToFilter * msPerDay);
};

/**
 * 거래내역을 지정된 기간으로 필터링합니다.
 * @param allTransactions 모든 거래내역
 * @param period 기간 (1주일, 1개월, 3개월)
 * @returns 필터링된 거래내역
 */
export const filterTransactionsByPeriod = (
  allTransactions: Transaction[],
  period: '1주일' | '1개월' | '3개월',
): Transaction[] => {
  const cutoffDate = getCutoffDateByPeriod(period);

  // 기준 날짜 이후의 거래내역만 필터링
  return allTransactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= cutoffDate;
    })
    .sort((a, b) => {
      // 최신 날짜순으로 정렬
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};
