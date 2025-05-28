import { SlideData } from '../types';

/**
 * 슬라이드 데이터 정의
 */
export const slideData: SlideData[] = [
  {
    key: 'slide1',
    title: '모든 계좌를 한눈에 관리하세요',
    subtitle1: '원하는 결제 수단을',
    subtitle2: '자유롭게 선택해 사용할 수 있어요.',
    mediaType: 'image',
    source: require('@/modules/onboarding/assets/slide1.jpg'),
  },
  {
    key: 'slide2',
    title: '더 빠른 송금을 경험하세요',
    subtitle1: '단순한 송금을 넘어,',
    subtitle2: '더 빠르고 간편한 송금 프로세스',
    mediaType: 'video',
    source: require('@/modules/onboarding/assets/slide2.mp4'),
  },
  {
    key: 'slide3',
    title: `SSOK만의 블루투스 송금`,
    subtitle1: '블루투스 송금으로',
    subtitle2: '주변 사람에게 빠르게 송금해보세요',
    mediaType: 'lottie',
    source: require('@/modules/onboarding/assets/slide3.json'),
  },
  {
    key: 'slide4',
    title: '지금 SSOK과 함께 시작하세요',
    subtitle1: '간편 송금의 모든 경험을',
    subtitle2: '지금 바로 만나보세요',
    mediaType: 'video',
    source: require('@/modules/onboarding/assets/slide4.mp4'),
  },
];
