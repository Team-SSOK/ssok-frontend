# Auth Module 🔐

SSOK 앱의 인증 및 사용자 관리를 담당하는 모듈입니다. SMS 인증 기반 회원가입부터 PIN 로그인까지 모든 인증 관련 기능을 제공합니다.

## 주요 기능

- 📱 **휴대폰 SMS 인증**: SMS 인증번호를 통한 안전한 본인 인증
- 📝 **회원가입 플로우**: 이름, 생년월일, 휴대폰 인증을 통한 회원가입
- 🔢 **PIN 로그인 시스템**: 6자리 PIN을 통한 빠른 로그인
- 🎫 **JWT 토큰 관리**: 자동 토큰 갱신 및 보안 관리
- 👤 **사용자 상태 관리**: Zustand 기반 전역 상태 관리
- 🔄 **토큰 자동 갱신**: 리프레시 토큰을 통한 무중단 세션 유지

## 구조

```
auth/
├── components/              # 인증 관련 컴포넌트
│   ├── PhoneVerificationInput.tsx    # 휴대폰 인증 입력
│   ├── CodeVerificationInput.tsx     # 인증번호 입력
│   ├── PinKeypad.tsx                 # PIN 입력 키패드
│   ├── PinDots.tsx                   # PIN 입력 상태 표시
│   ├── PinScreen.tsx                 # PIN 입력 화면
│   └── index.ts                      # 컴포넌트 exports
├── hooks/                   # 커스텀 훅
│   ├── useRegisterForm.ts            # 회원가입 폼 관리
│   ├── useRegisterState.ts           # 회원가입 상태 관리
│   └── usePin.ts                     # PIN 입력 관리
├── store/                   # 상태 관리
│   └── authStore.ts                  # 인증 상태 스토어
├── api/                     # API 호출
│   └── authApi.ts                    # 인증 API 함수들
├── utils/                   # 유틸리티
│   └── constants.ts                  # 에러 메시지 등 상수
├── auth_api_spec.md         # API 명세서
└── index.ts                 # 모듈 exports
```

## 사용법

### 1. 회원가입 플로우

```tsx
import { useRegisterForm, useAuthStore } from '@/modules/auth';

export default function RegisterScreen() {
  const { form, errors, handleChange, validateForm } = useRegisterForm();
  const { 
    sendVerificationCode, 
    verifyCode, 
    saveRegistrationInfo,
    verificationSent,
    verificationConfirmed 
  } = useAuthStore();

  const handleSendCode = async () => {
    const result = await sendVerificationCode(form.phoneNumber);
    if (result.success) {
      // 인증번호 발송 성공
    }
  };

  const handleVerifyCode = async () => {
    const result = await verifyCode(form.phoneNumber, form.verificationCode);
    if (result.success) {
      // 인증 완료, PIN 설정으로 이동
    }
  };

  return (
    <View>
      <PhoneVerificationInput
        phoneNumber={form.phoneNumber}
        onChangePhoneNumber={(text) => handleChange('phoneNumber', text)}
        onSendVerification={handleSendCode}
        verificationSent={verificationSent}
      />
      {verificationSent && (
        <CodeVerificationInput
          verificationCode={form.verificationCode}
          onChangeVerificationCode={(text) => handleChange('verificationCode', text)}
          onVerifyCode={handleVerifyCode}
          verificationConfirmed={verificationConfirmed}
        />
      )}
    </View>
  );
}
```

### 2. PIN 설정 및 로그인

```tsx
import { PinKeypad, usePinInput } from '@/modules/auth';

export default function PinScreen() {
  const { pin, handlePinChange, clearPin } = usePinInput();
  
  const handlePinComplete = async (completedPin: string) => {
    // PIN 처리 로직
    if (isSetupMode) {
      // PIN 설정
      await setupPin(completedPin);
    } else {
      // PIN 로그인
      await loginWithPin(completedPin);
    }
  };

  return (
    <View>
      <PinDots pin={pin} />
      <PinKeypad
        pin={pin}
        onPinChange={handlePinChange}
        onPinComplete={handlePinComplete}
        maxLength={6}
      />
    </View>
  );
}
```

### 3. 인증 상태 확인

```tsx
import { useAuthStore } from '@/modules/auth';

export default function App() {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    accessToken 
  } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !accessToken) {
    return <LoginScreen />;
  }

  return <MainApp user={user} />;
}
```

## API 명세

자세한 API 명세는 [auth_api_spec.md](./auth_api_spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `POST /api/users/phone`: 휴대폰 인증번호 발송
- `POST /api/users/phone/verify`: 인증번호 확인
- `POST /api/users/signup`: 회원가입
- `POST /api/auth/login`: PIN 로그인
- `POST /api/auth/refresh`: 토큰 갱신
- `POST /api/auth/foreground`: 포그라운드 복귀 시 PIN 재인증

## 상태 관리

### AuthStore 상태

```typescript
interface AuthState {
  // 사용자 정보
  user: User | null;
  pin: string;
  isAuthenticated: boolean;
  
  // 토큰 관리
  accessToken: string | null;
  refreshToken: string | null;
  
  // 로딩 상태
  isLoading: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
  
  // 인증 상태
  verificationSent: boolean;
  verificationConfirmed: boolean;
  
  // 에러 처리
  error: string | null;
}
```

### 주요 액션

```typescript
interface AuthActions {
  // 휴대폰 인증
  sendVerificationCode: (phoneNumber: string) => Promise<ApiResponse>;
  verifyCode: (phoneNumber: string, code: string) => Promise<ApiResponse>;
  resetVerification: () => void;
  
  // 회원가입
  saveRegistrationInfo: (username: string, phoneNumber: string, birthDate: string, pin: string) => void;
  signup: () => Promise<ApiResponse>;
  
  // 로그인/로그아웃
  login: (userId: number, pinCode: number) => Promise<ApiResponse>;
  logout: () => void;
  
  // PIN 관리
  setPin: (pin: string) => void;
  clearPin: () => void;
  
  // 토큰 관리
  refreshToken: () => Promise<ApiResponse>;
  
  // 상태 관리
  clearError: () => void;
  isUserRegistered: () => boolean;
}
```

## 컴포넌트 상세

### PhoneVerificationInput

휴대폰 번호 입력 및 인증번호 발송 컴포넌트

**Props:**
- `phoneNumber: string` - 입력된 휴대폰 번호
- `onChangePhoneNumber: (text: string) => void` - 번호 변경 핸들러
- `onSendVerification: () => void` - 인증번호 발송 핸들러
- `isLoading?: boolean` - 로딩 상태
- `verificationSent?: boolean` - 인증번호 발송 여부
- `disabled?: boolean` - 비활성화 상태
- `error?: string` - 에러 메시지

### CodeVerificationInput

인증번호 입력 및 확인 컴포넌트

**Props:**
- `verificationCode: string` - 입력된 인증번호
- `onChangeVerificationCode: (text: string) => void` - 코드 변경 핸들러
- `onVerifyCode: () => void` - 인증 확인 핸들러
- `isLoading?: boolean` - 로딩 상태
- `verificationConfirmed?: boolean` - 인증 완료 여부
- `disabled?: boolean` - 비활성화 상태
- `error?: string` - 에러 메시지

### PinKeypad

PIN 입력을 위한 숫자 키패드 컴포넌트

**Props:**
- `pin: string` - 현재 입력된 PIN
- `onPinChange: (pin: string) => void` - PIN 변경 핸들러
- `onPinComplete?: (pin: string) => void` - PIN 입력 완료 핸들러
- `maxLength?: number` - 최대 PIN 길이 (기본값: 6)
- `disabled?: boolean` - 비활성화 상태

### PinDots

PIN 입력 상태를 시각적으로 표시하는 컴포넌트

**Props:**
- `pin: string` - 현재 입력된 PIN
- `maxLength?: number` - 최대 PIN 길이 (기본값: 6)
- `filledColor?: string` - 입력된 점의 색상
- `emptyColor?: string` - 빈 점의 색상

## 훅 상세

### useRegisterForm

회원가입 폼의 상태와 검증을 관리하는 훅

**반환값:**
- `form: RegisterFormData` - 폼 데이터
- `errors: FormErrors` - 검증 에러
- `handleChange: (key, value) => void` - 폼 필드 변경
- `validateForm: () => boolean` - 폼 검증
- `isFormComplete: boolean` - 폼 완성 여부

### useRegisterState

회원가입 과정의 단계별 상태를 관리하는 훅

**반환값:**
- `currentStep: RegisterStep` - 현재 단계
- `goToStep: (step) => void` - 단계 이동
- `goBack: () => void` - 이전 단계
- `canGoBack: boolean` - 뒤로가기 가능 여부

### usePinInput

PIN 입력 상태를 관리하는 훅

**반환값:**
- `pin: string` - 현재 PIN
- `handlePinChange: (pin) => void` - PIN 변경
- `clearPin: () => void` - PIN 초기화

## 보안 고려사항

### 1. 토큰 관리
- JWT 토큰은 Expo SecureStore에 저장
- 자동 토큰 갱신으로 세션 유지
- 토큰 만료 시 자동 로그아웃

### 2. PIN 보안
- PIN은 서버에서 해시화되어 저장
- 클라이언트에서는 평문으로만 전송
- 연속 실패 시 계정 잠금 (서버 측 구현)

### 3. API 통신
- HTTPS 통신 강제
- 인증 헤더를 통한 API 접근 제어
- Rate limiting으로 브루트포스 방지 (서버 측)

## 에러 처리

### 주요 에러 메시지
```typescript
export const ERROR_MESSAGES = {
  REQUIRED_USERNAME: '이름을 입력해주세요.',
  REQUIRED_BIRTH_DATE: '생년월일을 입력해주세요.',
  INVALID_BIRTH_DATE: '유효하지 않은 생년월일입니다.',
  REQUIRED_PHONE: '휴대폰 번호를 입력해주세요.',
  INVALID_PHONE: '올바르지 않은 휴대폰 번호입니다.',
  PHONE_VERIFICATION_REQUIRED: '휴대폰 인증을 완료해주세요.',
  REQUIRED_VERIFICATION_CODE: '인증번호를 입력해주세요.',
  INVALID_VERIFICATION_CODE: '인증번호가 올바르지 않습니다.',
  TERMS_AGREEMENT_REQUIRED: '서비스 이용약관에 동의해주세요.',
  PIN_MISMATCH: 'PIN 번호가 일치하지 않습니다.',
  LOGIN_FAILED: '로그인에 실패했습니다. 사용자 정보나 PIN을 확인해주세요.',
};
```

## 의존성

### 외부 라이브러리
- `expo-secure-store`: 토큰 안전 저장
- `zustand`: 상태 관리
- `axios`: HTTP 클라이언트

### 내부 의존성
- `@/components`: 공통 UI 컴포넌트
- `@/constants`: 앱 전역 상수
- `@/utils`: 공통 유틸리티

---

**🔒 인증 관련 문의나 개선 사항이 있다면 백엔드팀에 연락해주세요!** 