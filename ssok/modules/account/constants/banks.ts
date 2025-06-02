import { ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Bank {
  id: string;
  name: string;
  code: string;
  logoSource?: ImageSourcePropType;
  color: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * 한국 주요 은행 목록
 * 
 * 은행 코드 및 브랜딩 정보를 포함한 정적 데이터
 * 계좌 등록, 표시 등에서 사용됨
 */
export const BANKS: Bank[] = [
  {
    id: 'ssok',
    name: 'SSOK뱅크',
    code: '001',
    logoSource: require('@/assets/banks/ssokbank.png'),
    color: '#3386FF',
  },
  {
    id: 'kakao',
    name: '카카오뱅크',
    code: '002',
    logoSource: require('@/assets/banks/kakaobank.jpg'),
    color: '#FFCC00',
  },
  {
    id: 'kb',
    name: 'KB국민은행',
    code: '003',
    logoSource: require('@/assets/banks/kbbank.jpg'),
    color: '#FFCC33',
  },
  {
    id: 'shinhan',
    name: '신한은행',
    code: '004',
    logoSource: require('@/assets/banks/shinhanbank.jpg'),
    color: '#3F91DE',
  },
  {
    id: 'woori',
    name: '우리은행',
    code: '005',
    logoSource: require('@/assets/banks/wooribank.jpg'),
    color: '#005EB8',
  },
  {
    id: 'keb',
    name: 'KEB하나은행',
    code: '006',
    logoSource: require('@/assets/banks/kebbank.jpg'),
    color: '#46A148',
  },
  {
    id: 'nh',
    name: 'NH농협은행',
    code: '007',
    logoSource: require('@/assets/banks/nhbank.jpg'),
    color: '#01A064',
  },
  {
    id: 'ibk',
    name: 'IBK기업은행',
    code: '008',
    logoSource: require('@/assets/banks/ibkbank.jpg'),
    color: '#0091D0',
  },
  {
    id: 'kbank',
    name: '케이뱅크',
    code: '009',
    logoSource: require('@/assets/banks/kbank.jpg'),
    color: '#FE5958',
  },
  {
    id: 'toss',
    name: '토스뱅크',
    code: '010',
    logoSource: require('@/assets/banks/tossbank.jpg'),
    color: '#3182F6',
  },
];

/**
 * 은행 코드로 은행 정보 조회
 */
export const getBankByCode = (code: string): Bank | undefined => {
  return BANKS.find(bank => bank.code === code);
};

/**
 * 은행 ID로 은행 정보 조회
 */
export const getBankById = (id: string): Bank | undefined => {
  return BANKS.find(bank => bank.id === id);
};

/**
 * 은행 코드로 은행명 조회 (호환성 유지)
 * @param code 은행 코드 (문자열 또는 숫자)
 */
export const getBankName = (code: string | number): string => {
  const codeStr = String(code).padStart(3, '0'); // 숫자를 3자리 문자열로 변환
  const bank = getBankByCode(codeStr);
  return bank?.name || '알 수 없는 은행';
};

/**
 * 계좌 타입 코드에 따른 계좌 종류
 */
export const getAccountType = (accountTypeCode: number): string => {
  const accountTypes: Record<number, string> = {
    1: '예금',
    2: '적금',
    3: '청약',
    4: '대출',
  };

  return accountTypes[accountTypeCode] || '기타';
};

// 기존 코드와의 호환성을 위한 export
export const banks = BANKS; 