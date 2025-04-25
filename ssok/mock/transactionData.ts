import { Transaction } from '@/modules/account/components/TransactionItem';
import { getDateBefore } from '@/utils/dateUtils';

// 모든 거래내역 데이터 (3개월치)
export const transactions: Transaction[] = [
  // 1주일 이내
  {
    transferID: 1,
    accountId: 10001,
    counterpartAccount: '110-456-789012',
    counterpartName: '스타벅스',
    transferType: 'WITHDRAW',
    transferMoney: 5100,
    currencyCode: 1, // 원화
    transferMethod: 0, // 일반
    createdAt: getDateBefore(1), // 1일 전
    balanceAfterTransaction: 1244900,
  },
  {
    transferID: 2,
    accountId: 10001,
    counterpartAccount: '110-555-123456',
    counterpartName: '배달의민족',
    transferType: 'WITHDRAW',
    transferMoney: 15000,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(2), // 2일 전
    balanceAfterTransaction: 1250000,
  },
  {
    transferID: 3,
    accountId: 10001,
    counterpartAccount: '110-222-333444',
    counterpartName: '쿠팡',
    transferType: 'WITHDRAW',
    transferMoney: 28500,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(4), // 4일 전
    balanceAfterTransaction: 1265000,
  },
  {
    transferID: 4,
    accountId: 10001,
    counterpartAccount: '110-789-456123',
    counterpartName: '편의점',
    transferType: 'WITHDRAW',
    transferMoney: 6500,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(6), // 6일 전
    balanceAfterTransaction: 1293500,
  },
  // 1개월 이내 (1주일 이후)
  {
    transferID: 5,
    accountId: 10001,
    counterpartAccount: '210-123-456789',
    counterpartName: '월급',
    transferType: 'DEPOSIT',
    transferMoney: 2500000,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(10), // 10일 전
    balanceAfterTransaction: 1300000,
  },
  {
    transferID: 6,
    accountId: 10001,
    counterpartAccount: '110-777-888999',
    counterpartName: '넷플릭스',
    transferType: 'WITHDRAW',
    transferMoney: 17000,
    currencyCode: 1,
    transferMethod: 1, // 자동이체
    createdAt: getDateBefore(15), // 15일 전
    balanceAfterTransaction: 800000,
  },
  {
    transferID: 7,
    accountId: 10001,
    counterpartAccount: '110-333-555777',
    counterpartName: '온라인쇼핑',
    transferType: 'WITHDRAW',
    transferMoney: 68000,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(20), // 20일 전
    balanceAfterTransaction: 817000,
  },
  {
    transferID: 8,
    accountId: 10001,
    counterpartAccount: '110-444-666888',
    counterpartName: '통신요금',
    transferType: 'WITHDRAW',
    transferMoney: 55000,
    currencyCode: 1,
    transferMethod: 1, // 자동이체
    createdAt: getDateBefore(25), // 25일 전
    balanceAfterTransaction: 885000,
  },
  // 3개월 이내 (1개월 이후)
  {
    transferID: 9,
    accountId: 10001,
    counterpartAccount: '210-123-456789',
    counterpartName: '월급',
    transferType: 'DEPOSIT',
    transferMoney: 2500000,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(40), // 40일 전
    balanceAfterTransaction: 940000,
  },
  {
    transferID: 10,
    accountId: 10001,
    counterpartAccount: '110-222-444666',
    counterpartName: '보험료',
    transferType: 'WITHDRAW',
    transferMoney: 150000,
    currencyCode: 1,
    transferMethod: 1, // 자동이체
    createdAt: getDateBefore(45), // 45일 전
    balanceAfterTransaction: 440000,
  },
  {
    transferID: 11,
    accountId: 10001,
    counterpartAccount: '110-999-888777',
    counterpartName: '헬스장',
    transferType: 'WITHDRAW',
    transferMoney: 99000,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(60), // 60일 전
    balanceAfterTransaction: 590000,
  },
  {
    transferID: 12,
    accountId: 10001,
    counterpartAccount: '210-123-456789',
    counterpartName: '월급',
    transferType: 'DEPOSIT',
    transferMoney: 2500000,
    currencyCode: 1,
    transferMethod: 0,
    createdAt: getDateBefore(70), // 70일 전
    balanceAfterTransaction: 689000,
  },
  {
    transferID: 13,
    accountId: 10001,
    counterpartAccount: '110-555-123456',
    counterpartName: '해외직구',
    transferType: 'WITHDRAW',
    transferMoney: 250000,
    currencyCode: 2, // 달러를 원화로 환산
    transferMethod: 0,
    createdAt: getDateBefore(85), // 85일 전
    balanceAfterTransaction: 189000,
  },
];
