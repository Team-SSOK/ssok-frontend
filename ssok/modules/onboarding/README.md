# 온보딩 모듈 (Onboarding Module)

React Native Reanimated를 활용한 부드러운 애니메이션 효과가 포함된 온보딩 화면 모듈입니다.

## 주요 기능

- ✨ **부드러운 애니메이션**: React Native Reanimated를 사용한 고성능 애니메이션
- 📱 **반응형 디자인**: 다양한 화면 크기에 대응
- 🎯 **타입 안전성**: TypeScript로 작성된 완전한 타입 지원
- 🔧 **커스터마이징 가능**: 쉽게 수정 가능한 컴포넌트 구조
- 📊 **페이지네이션**: 현재 위치를 표시하는 애니메이션 도트
- 🎮 **직관적인 네비게이션**: 스와이프 및 버튼을 통한 네비게이션

## 구조

```
onboarding/
├── components/           # 컴포넌트들
│   ├── OnboardingScreen.tsx    # 메인 온보딩 화면
│   ├── OnboardingItem.tsx      # 개별 슬라이드 아이템
│   ├── PaginationDots.tsx      # 페이지네이션 도트
│   ├── OnboardingButton.tsx    # 네비게이션 버튼
│   └── index.ts               # 컴포넌트 exports
├── hooks/               # 커스텀 훅들
│   ├── useOnboarding.ts       # 온보딩 로직 훅
│   └── index.ts              # 훅 exports
├── types/               # 타입 정의
│   └── index.ts              # 타입 exports
├── utils/               # 유틸리티 및 데이터
│   └── slides.tsx            # 슬라이드 데이터
├── demo/                # 사용 예시
│   └── OnboardingDemo.tsx    # 데모 컴포넌트
└── index.ts             # 메인 exports
```

## 사용법

### 기본 사용법

```tsx
import React from 'react';
import { OnboardingScreen } from '@/modules/onboarding';

const App = () => {
  const handleOnboardingComplete = () => {
    // 온보딩 완료 후 처리 로직
    console.log('온보딩 완료!');
  };

  return <OnboardingScreen onComplete={handleOnboardingComplete} />;
};
```

### 커스텀 슬라이드 데이터

슬라이드 데이터는 `utils/slides.tsx`에서 수정할 수 있습니다:

```tsx
export const slideData: SlideData[] = [
  {
    key: 'slide1',
    title: '제목',
    subtitle1: '부제목 1',
    subtitle2: '부제목 2',
    mediaType: 'image',
    source: require('./assets/image.jpg'),
  },
  // ... 더 많은 슬라이드
];
```

## 컴포넌트 설명

### OnboardingScreen

메인 온보딩 화면 컴포넌트입니다.

**Props:**

- `onComplete: () => void` - 온보딩 완료 시 호출되는 콜백

### OnboardingItem

개별 슬라이드를 렌더링하는 컴포넌트입니다.

**특징:**

- 스크롤 위치에 따른 이미지 및 텍스트 애니메이션
- 패럴랙스 효과
- 페이드 인/아웃 효과

### PaginationDots

현재 슬라이드 위치를 표시하는 페이지네이션 도트입니다.

**특징:**

- 활성 도트 확장 애니메이션
- 색상 변화 애니메이션
- 투명도 변화

### OnboardingButton

네비게이션 버튼 컴포넌트입니다.

**특징:**

- 마지막 슬라이드에서 '시작하기' 버튼으로 변경
- 버튼 크기 애니메이션
- 텍스트/아이콘 전환 애니메이션

## 애니메이션 효과

### 이미지 애니메이션

- **패럴랙스 효과**: 스크롤에 따른 이미지 이동
- **스케일 애니메이션**: 활성 슬라이드 확대/축소
- **부드러운 전환**: `interpolate`를 사용한 자연스러운 애니메이션

### 텍스트 애니메이션

- **페이드 효과**: 투명도 변화
- **슬라이드 효과**: Y축 이동 애니메이션

### 페이지네이션 애니메이션

- **도트 확장**: 활성 도트 너비 증가
- **색상 변화**: 활성/비활성 상태 색상 전환
- **투명도 조절**: 부드러운 시각적 피드백

### 버튼 애니메이션

- **크기 변화**: 마지막 슬라이드에서 버튼 확장
- **콘텐츠 전환**: 화살표에서 텍스트로 부드러운 전환
- **스프링 애니메이션**: 자연스러운 탄성 효과

## 커스터마이징

### 색상 변경

컴포넌트 스타일에서 색상을 쉽게 변경할 수 있습니다:

```tsx
// PaginationDots.tsx
const backgroundColor = interpolateColor(
  x.value,
  [...],
  ['#E0E0E0', '#YOUR_COLOR', '#E0E0E0'], // 여기서 색상 변경
);
```

### 애니메이션 타이밍 조절

애니메이션 지속 시간과 타입을 조절할 수 있습니다:

```tsx
// OnboardingButton.tsx
return {
  opacity: withTiming(isLastSlide ? 1 : 0, { duration: 300 }), // duration 조절
};
```

## 의존성

- `react-native-reanimated`: 애니메이션 라이브러리
- `react-native`: React Native 프레임워크

## 성능 최적화

- **UI 스레드 실행**: 모든 애니메이션이 UI 스레드에서 실행
- **메모이제이션**: `useCallback`을 사용한 함수 메모이제이션
- **효율적인 렌더링**: FlatList를 사용한 가상화된 렌더링
- **최적화된 스크롤**: `scrollEventThrottle`을 통한 스크롤 이벤트 최적화
