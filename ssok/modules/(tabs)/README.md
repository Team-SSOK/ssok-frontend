# Tabs Module 📑

SSOK 앱의 하단 탭 네비게이션 컴포넌트를 제공하는 모듈입니다.

## 주요 기능

- 🧭 **하단 탭 바**: 메인 네비게이션 탭
- 🎨 **커스텀 디자인**: SSOK 브랜드에 맞는 탭 디자인
- 🔔 **배지 표시**: 알림 개수 표시
- ⚡ **빠른 전환**: 탭 간 즉시 전환

## 구조

```
(tabs)/
└── components/         # 탭 관련 컴포넌트
    ├── CustomTabBar.tsx     # 커스텀 탭 바
    ├── TabIcon.tsx          # 탭 아이콘
    └── index.ts             # exports
```

## 사용법

```tsx
import { CustomTabBar } from '@/modules/(tabs)';

// Expo Router에서 자동으로 사용됨
// app/(app)/(tabs)/_layout.tsx에서 설정
```

---

**📑 탭 네비게이션 관련 문의는 프론트엔드팀에 연락해주세요!** 