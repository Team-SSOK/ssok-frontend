# Auth Module 🔐

SSOK 앱의 인증 및 사용자 관리를 담당하는 모듈입니다. 회원가입부터 로그인, 사용자 상태 관리까지 모든 인증 관련 기능을 제공합니다.

## 주요 기능

- 📱 **휴대폰 인증 회원가입**: SMS 인증을 통한 안전한 회원가입
- 🔢 **PIN 로그인 시스템**: 6자리 PIN을 통한 빠른 로그인
- 🔒 **생체 인증**: 지문/Face ID를 통한 편리한 인증
- 🎫 **JWT 토큰 관리**: 자동 토큰 갱신 및 보안 관리
- 👤 **사용자 상태 관리**: Zustand 기반 전역 상태 관리
- 🔄 **자동 로그인**: 생체 인증 성공 시 자동 로그인
- ⚡ **PIN 재설정**: 기존 PIN 변경 기능

## 구조

```
auth/
├── components/              # 인증 관련 컴포넌트
│   ├── PhoneVerificationInput.tsx    # 휴대폰 인증 입력
│   ├── CodeVerificationInput.tsx     # 인증번호 입력
│   ├── PinKeypad.tsx                 # PIN 입력 키패드
│   ├── BiometricPrompt.tsx           # 생체 인증 프롬프트
│   └── index.ts                      # 컴포넌트 exports
├── hooks/                   # 커스텀 훅
│   ├── useRegisterForm.ts            # 회원가입 폼 관리
│   ├── usePinLogin.ts                # PIN 로그인 로직
│   ├── useBiometric.ts               # 생체 인증 관리
│   └── index.ts                      # 훅 exports
├── store/                   # 상태 관리
│   └── authStore.ts                  # 인증 상태 스토어
├── api/                     # API 호출
│   ├── authApi.ts                    # 인증 API 함수들
│   └── types.ts                      # API 타입 정의
├── utils/                   # 유틸리티
│   ├── constants.ts                  # 에러 메시지 등 상수
│   ├── validation.ts                 # 입력값 검증
│   └── biometricUtils.ts            # 생체 인증 유틸리티
├── auth_api_spec.md         # API 명세서
└── index.ts                 # 모듈 exports
```

## 사용법

### 1. 회원가입 플로우

```tsx
import { useRegisterForm, useAuthStore } from '@/modules/auth';

export default function RegisterScreen() {
  const { form, errors, handleChange, validateForm } = useRegisterForm();
  const { sendVerificationCode, verifyCode, saveRegistrationInfo } = useAuthStore();

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    // 1. 휴대폰 인증번호 발송
    await sendVerificationCode(form.phoneNumber);
    
    // 2. 인증번호 확인
    await verifyCode(form.phoneNumber, form.verificationCode);
    
    // 3. 회원정보 저장
    await saveRegistrationInfo(
      form.username,
      form.phoneNumber,
      form.birthDate
    );
  };

  return (
    <View>
      <PhoneVerificationInput
        phoneNumber={form.phoneNumber}
        onChangePhoneNumber={(text) => handleChange('phoneNumber', text)}
        onSendVerification={handleSendVerificationCode}
      />
      <CodeVerificationInput
        verificationCode={form.verificationCode}
        onChangeVerificationCode={(text) => handleChange('verificationCode', text)}
        onVerifyCode={handleVerifyCode}
      />
    </View>
  );
}
```

### 2. PIN 로그인

```tsx
import { usePinLogin, PinKeypad } from '@/modules/auth';

export default function PinLoginScreen() {
  const { pin, isLoading, error, handlePinComplete, handlePinChange } = usePinLogin();

  return (
    <View>
      <PinKeypad
        pin={pin}
        onPinChange={handlePinChange}
        onPinComplete={handlePinComplete}
        isLoading={isLoading}
        error={error}
      />
    </View>
  );
}
```

### 3. 생체 인증

```tsx
import { useBiometric } from '@/modules/auth';

export default function BiometricLoginScreen() {
  const {
    isAvailable,
    biometricType,
    authenticate,
    isLoading
  } = useBiometric();

  const handleBiometricLogin = async () => {
    const result = await authenticate();
    if (result.success) {
      // 자동 로그인 처리
    }
  };

  return (
    <View>
      {isAvailable && (
        <TouchableOpacity onPress={handleBiometricLogin}>
          <Text>
            {biometricType === 'FaceID' ? 'Face ID로 로그인' : '지문으로 로그인'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### 4. 인증 상태 확인

```tsx
import { useAuthStore } from '@/modules/auth';

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainApp user={user} />;
}
```

## API 명세

자세한 API 명세는 [auth_api_spec.md](./auth_api_spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `POST /auth/send-verification`: 인증번호 발송
- `POST /auth/verify-code`: 인증번호 확인  
- `POST /auth/register`: 회원가입
- `POST /auth/login-pin`: PIN 로그인
- `POST /auth/refresh-token`: 토큰 갱신

## 상태 관리

### AuthStore 상태

```typescript
interface AuthState {
  // 사용자 정보
  user: User | null;
  isAuthenticated: boolean;
  
  // 로딩 상태
  isLoading: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
  
  // 인증 상태
  verificationSent: boolean;
  verificationConfirmed: boolean;
  
  // 에러 처리
  error: string | null;
  
  // 토큰 관리
  accessToken: string | null;
  refreshToken: string | null;
}
```

### 주요 액션

```typescript
interface AuthActions {
  // 인증 프로세스
  sendVerificationCode: (phoneNumber: string) => Promise<ApiResponse>;
  verifyCode: (phoneNumber: string, code: string) => Promise<ApiResponse>;
  saveRegistrationInfo: (username: string, phoneNumber: string, birthDate: string) => void;
  
  // 로그인/로그아웃
  loginWithPin: (pin: string) => Promise<ApiResponse>;
  logout: () => void;
  
  // 토큰 관리
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<boolean>;
  
  // 상태 관리
  setUser: (user: User) => void;
  clearError: () => void;
  resetVerification: () => void;
}
```

## 컴포넌트 상세

### PhoneVerificationInput

휴대폰 번호 입력 및 인증번호 발송 컴포넌트

**Props:**
- `phoneNumber: string` - 입력된 휴대폰 번호
- `onChangePhoneNumber: (text: string) => void` - 번호 변경 핸들러
- `onSendVerification: () => void` - 인증번호 발송 핸들러
- `isLoading: boolean` - 로딩 상태
- `error?: string` - 에러 메시지

### CodeVerificationInput

인증번호 입력 및 확인 컴포넌트

**Props:**
- `verificationCode: string` - 입력된 인증번호
- `onChangeVerificationCode: (text: string) => void` - 코드 변경 핸들러  
- `onVerifyCode: () => void` - 인증 확인 핸들러
- `isLoading: boolean` - 로딩 상태
- `error?: string` - 에러 메시지

### PinKeypad

PIN 입력을 위한 숫자 키패드 컴포넌트

**Props:**
- `pin: string` - 현재 입력된 PIN
- `onPinChange: (pin: string) => void` - PIN 변경 핸들러
- `onPinComplete: (pin: string) => void` - PIN 입력 완료 핸들러
- `maxLength?: number` - 최대 PIN 길이 (기본값: 6)
- `isLoading?: boolean` - 로딩 상태

## 보안 고려사항

### 1. 토큰 관리
- JWT 토큰은 secure storage에 저장
- 자동 토큰 갱신으로 세션 유지
- 토큰 만료 시 자동 로그아웃

### 2. PIN 보안
- PIN은 해시화되어 저장
- 연속 실패 시 계정 잠금
- 생체 인증 연동으로 보안 강화

### 3. API 통신
- HTTPS 통신 강제
- 요청/응답 암호화
- Rate limiting으로 브루트포스 방지

## 에러 처리

### 에러 타입
- `NETWORK_ERROR`: 네트워크 연결 오류
- `INVALID_PHONE`: 잘못된 휴대폰 번호
- `INVALID_CODE`: 잘못된 인증번호
- `EXPIRED_CODE`: 만료된 인증번호
- `TOO_MANY_ATTEMPTS`: 시도 횟수 초과

### 에러 메시지
```typescript
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  INVALID_PHONE: '올바른 휴대폰 번호를 입력해주세요.',
  INVALID_CODE: '인증번호가 일치하지 않습니다.',
  EXPIRED_CODE: '인증번호가 만료되었습니다.',
  TOO_MANY_ATTEMPTS: '너무 많은 시도를 했습니다. 잠시 후 다시 시도해주세요.',
};
```

## 테스트

### 단위 테스트
- 폼 검증 로직
- API 함수들
- 유틸리티 함수들

### 통합 테스트  
- 회원가입 플로우
- 로그인 플로우
- 토큰 갱신 로직

## 의존성

### 외부 라이브러리
- `expo-local-authentication`: 생체 인증
- `expo-secure-store`: 토큰 저장
- `zustand`: 상태 관리
- `react-hook-form`: 폼 관리

### 내부 의존성
- `@/components`: 공통 UI 컴포넌트
- `@/constants`: 앱 전역 상수
- `@/utils`: 공통 유틸리티

---

**🔒 보안 관련 문의나 개선 사항이 있다면 보안팀에 연락해주세요!** 