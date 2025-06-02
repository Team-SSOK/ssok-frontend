import { banks } from '@/modules/account/constants/banks';

/**
 * 은행 이름으로 은행 코드를 조회하는 유틸리티 함수
 */
export function getBankCodeByName(bankName: string): number {
  const bank = banks.find((bank) => bank.name === bankName);
  // 코드를 숫자로 변환 (코드는 '001' 형식이므로 정수로 변환)
  return bank ? parseInt(bank.code, 10) : 0;
}

/**
 * 은행 코드로 은행 이름을 조회하는 유틸리티 함수
 */
export function getBankNameByCode(bankCode: number): string {
  const codeString = String(bankCode).padStart(3, '0');
  const bank = banks.find((bank) => bank.code === codeString);
  return bank ? bank.name : '알 수 없는 은행';
}
