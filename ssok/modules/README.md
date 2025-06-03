# Modules Directory

SSOK 앱의 핵심 기능들을 모듈화하여 관리하는 디렉토리입니다. 각 모듈은 독립적이고 재사용 가능한 단위로 설계되어 있습니다.

## 📁 모듈 구조

```
modules/
├── auth/                    # 인증 및 회원가입
├── onboarding/              # 온보딩 화면
├── bluetooth/               # 블루투스 연결 및 디바이스 관리
├── transfer/                # 송금 및 결제
├── account/                 # 계좌 관리
├── settings/                # 사용자 설정
├── notification/            # 푸시 알림
├── tutorial/                # 튜토리얼 가이드
└── (tabs)/                  # 탭 네비게이션 컴포넌트
```

## 🔧 모듈별 주요 기능

### 🔐 Auth Module
**인증 및 사용자 관리**
- 회원가입 (휴대폰 인증)
- PIN 로그인 시스템
- 생체 인증 (지문, Face ID)
- JWT 토큰 관리
- 사용자 상태 관리

### 📱 Onboarding Module
**신규 사용자 온보딩**
- React Native Reanimated 기반 애니메이션
- 부드러운 슬라이드 전환
- 앱 주요 기능 소개
- 직관적인 UX 제공

### 📶 Bluetooth Module
**블루투스 디바이스 관리**
- 카드 리더기 연결
- 디바이스 스캔 및 페어링
- 카드 읽기/쓰기 작업
- 연결 상태 관리

### 💰 Transfer Module
**송금 및 결제 기능**
- 계좌 간 송금
- QR 코드 결제
- 거래 내역 관리
- 결제 승인 시스템

### 🏦 Account Module
**계좌 및 금융 정보 관리**
- 계좌 잔액 조회
- 계좌 목록 관리
- 거래 내역
- 카드 정보 관리

### ⚙️ Settings Module
**사용자 설정 및 프로필**
- 개인정보 관리
- 보안 설정
- 알림 설정
- 앱 환경설정

### 🔔 Notification Module
**푸시 알림 시스템**
- Expo Notifications 통합
- 권한 관리
- 로컬/원격 알림
- 알림 응답 처리

### 📚 Tutorial Module
**기능별 튜토리얼**
- 단계별 가이드
- 인터랙티브 도움말
- 기능 설명
- 사용법 안내

### 📑 (Tabs) Module
**탭 네비게이션**
- 하단 탭 바 컴포넌트
- 네비게이션 상태 관리

## 🏗️ 모듈 아키텍처

각 모듈은 다음과 같은 표준 구조를 따릅니다:

```
module-name/
├── components/          # React 컴포넌트
├── hooks/              # 커스텀 훅
├── stores/             # 상태 관리 (Zustand)
├── api/                # API 호출 함수
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── constants/          # 상수 정의
├── assets/             # 이미지, 아이콘 등
├── services/           # 비즈니스 로직
└── index.ts            # 모듈 exports
```

## 📋 코딩 규칙

### 명명 규칙
- **컴포넌트**: PascalCase (`UserProfile.tsx`)
- **훅**: camelCase with 'use' prefix (`useAuth.ts`)
- **스토어**: camelCase with 'Store' suffix (`authStore.ts`)
- **유틸리티**: camelCase (`formatPhoneNumber.ts`)
- **상수**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### 폴더 구조
- **컴포넌트**: 기능별로 그룹화
- **공통 컴포넌트**: 각 모듈의 `components/` 폴더
- **모듈 간 공유**: 루트 `components/` 폴더 활용

### Import 순서
1. React 및 React Native 라이브러리
2. 외부 라이브러리
3. `@/` alias를 사용한 절대 경로
4. 상대 경로

## 🔄 모듈 간 통신

### 1. Zustand Store를 통한 상태 공유
```typescript
// 다른 모듈에서 auth 상태 접근
import { useAuthStore } from '@/modules/auth';

const { user, isAuthenticated } = useAuthStore();
```

### 2. 이벤트 기반 통신
```typescript
// notification 모듈에서 transfer 이벤트 처리
import { useNotificationHandler } from '@/modules/notification';

useNotificationHandler('transfer-complete', handleTransferNotification);
```

### 3. API 공유
```typescript
// 공통 API 유틸리티 사용
import { apiClient } from '@/modules/auth/api';
```

## 📦 의존성 관리

### 외부 라이브러리
- **React Native Reanimated**: 애니메이션 (onboarding, ui)
- **Zustand**: 상태 관리 (모든 모듈)
- **Expo**: 플랫폼 기능 (notification, bluetooth)
- **React Hook Form**: 폼 관리 (auth, settings)

### 내부 의존성
- 공통 컴포넌트: `@/components`
- 공통 유틸리티: `@/utils`
- 공통 타입: `@/types`
- 테마 및 스타일: `@/constants`

## 🧪 테스트 전략

### 단위 테스트
- 각 모듈의 훅 및 유틸리티 함수
- 비즈니스 로직 검증

### 통합 테스트
- 모듈 간 상호작용
- API 통신 테스트

### E2E 테스트
- 사용자 시나리오 기반
- 주요 플로우 검증

## 🚀 성능 최적화

### 코드 분할
- 모듈별 lazy loading
- 컴포넌트 지연 로딩

### 상태 최적화
- 필요한 상태만 구독
- 메모이제이션 활용

### 리소스 관리
- 이미지 최적화
- 불필요한 리렌더링 방지

## 📝 개발 가이드라인

### 새 모듈 추가 시
1. 표준 폴더 구조 생성
2. `index.ts` 파일로 exports 정의
3. README.md 작성 (기능 설명, 사용법)
4. 테스트 코드 작성

### 기존 모듈 수정 시
1. 타입 안전성 확인
2. 다른 모듈에 미치는 영향 검토
3. 테스트 업데이트
4. 문서 갱신

## 🔍 문제 해결

### 일반적인 이슈
1. **순환 의존성**: `import` 구조 재검토
2. **상태 동기화**: Zustand store 활용
3. **성능 문제**: React DevTools로 분석
4. **타입 에러**: TypeScript 설정 확인

### 디버깅 도구
- React Native Debugger
- Flipper
- Zustand DevTools
- TypeScript 컴파일러

---

**📞 문의사항이나 개선 사항이 있다면 개발팀에 연락해주세요!** 