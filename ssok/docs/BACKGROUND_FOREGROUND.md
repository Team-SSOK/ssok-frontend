# 백그라운드/포그라운드 전환 보안 기능

## 개요

앱이 백그라운드로 전환되거나 포그라운드로 복귀할 때 보안을 위한 인증 시스템입니다.

## 주요 기능

### 1. 백그라운드 전환 시

- 앱이 백그라운드로 전환되면 자동으로 `/api/auth/background` API 호출
- 현재 Access Token을 서버의 블랙리스트에 추가
- 백그라운드 상태 및 시작 시간 기록

### 2. 포그라운드 복귀 시

- 앱이 포그라운드로 복귀하면 재인증 페이지로 자동 이동
- 기존 PinScreen 컴포넌트를 재사용하여 일관된 UI/UX 제공
- `/api/auth/foreground` API를 통해 새로운 토큰 발급
- 새로운 토큰은 자동으로 저장됨

## 구현된 컴포넌트

### API (authApi.ts)

```typescript
// 백그라운드 전환 API
authApi.background();

// 포그라운드 복귀 API (PIN 재인증)
authApi.foreground({ userId, pinCode });
```

### 훅 (useAppState.ts)

```typescript
const {
  appState, // 현재 앱 상태
  needsReauth, // 재인증 필요 여부
  handleReauth, // 재인증 처리 함수
  clearReauthRequest, // 재인증 요구 해제
  isInBackground, // 백그라운드 상태
  backgroundStartTime, // 백그라운드 시작 시간
} = useAppState();
```

### 페이지 및 컴포넌트

- **ReauthScreen** (`/reauth`): PinScreen을 재사용한 재인증 페이지
- **AppStateManager**: 앱 상태 관리 및 재인증 페이지 네비게이션
- **BackgroundService**: 백그라운드 상태 관리 서비스

## 사용 방법

1. **자동 통합**: `AppStateManager`가 `RootLayout`에 이미 추가되어 있어 별도 설정 불필요

2. **수동 사용**:

```typescript
import { useAppState } from '@/hooks/useAppState';
import { router } from 'expo-router';

function MyComponent() {
  const { needsReauth } = useAppState();

  useEffect(() => {
    if (needsReauth) {
      router.push('/reauth');
    }
  }, [needsReauth]);
}
```

## 보안 특징

- **일관된 UI**: 기존 PinScreen 컴포넌트 재사용으로 일관된 사용자 경험
- **최소 권한**: 백그라운드에서 최소한의 작업만 수행
- **자동 토큰 관리**: API 인터셉터에서 토큰 자동 저장
- **네비게이션 제어**: 재인증 페이지에서 뒤로가기 방지
- **상태 추적**: 백그라운드 지속 시간 및 상태 모니터링

## 플로우

1. 사용자가 홈 버튼을 눌러 앱을 백그라운드로 전환
2. `AppState` 변화 감지 → `background` API 호출
3. 사용자가 앱으로 복귀
4. 자동으로 `/reauth` 페이지로 이동
5. PinScreen을 통해 PIN 입력
6. `foreground` API 호출 → 새로운 토큰 발급 및 자동 저장
7. 이전 화면으로 복귀하여 정상적인 앱 사용 재개

## 라우팅 구조

```typescript
// _layout.tsx
<Stack.Protected guard={isAuthenticated}>
  <Stack.Screen name="(app)" />
  <Stack.Screen
    name="reauth"
    options={{
      presentation: 'modal',
      gestureEnabled: false, // 스와이프로 닫기 방지
      headerShown: false,
    }}
  />
</Stack.Protected>
```

## 설정

현재 보안 임계값은 30초로 설정되어 있습니다. 이는 `BackgroundService`에서 수정할 수 있습니다:

```typescript
const SECURITY_THRESHOLD = 30000; // 30초
```

## 변경사항

- ✅ **ReauthModal 제거**: 모달 방식에서 페이지 네비게이션 방식으로 변경
- ✅ **PinScreen 재사용**: 기존 PIN 입력 컴포넌트를 재사용하여 일관성 확보
- ✅ **네비게이션 개선**: 모달 프레젠테이션과 제스처 제어로 사용자 경험 향상
