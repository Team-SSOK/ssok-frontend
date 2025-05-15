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

// 한국 주요 은행 목록
export const banks: Bank[] = [
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
