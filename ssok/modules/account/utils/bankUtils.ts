import { banks, Bank } from '@/modules/account/constants/banks';

/**
 * 은행 코드 또는 이름으로 은행 정보를 찾는 유틸리티 함수
 */
export function getBankByCode(bankCode: number | string): Bank | undefined {
  // 은행 코드가 숫자면 문자열로 변환하고 3자리로 패딩
  const bankCodeStr =
    typeof bankCode === 'number'
      ? String(bankCode).padStart(3, '0')
      : String(bankCode);

  return banks.find((bank) => bank.code === bankCodeStr);
}

/**
 * 은행 이름으로 은행 정보를 찾는 유틸리티 함수
 */
export function getBankByName(bankName: string): Bank | undefined {
  return banks.find((bank) => bank.name === bankName);
}

/**
 * 은행 코드 또는 이름으로 은행 정보를 찾는 유틸리티 함수
 */
export function findBank(
  bankCode?: number | string,
  bankName?: string,
): Bank | undefined {
  // 은행 코드로 찾기 시도
  if (bankCode) {
    const bankByCode = getBankByCode(bankCode);
    if (bankByCode) return bankByCode;
  }

  // 은행 이름으로 찾기 시도
  if (bankName) {
    const bankByName = getBankByName(bankName);
    if (bankByName) return bankByName;
  }

  return undefined;
}
