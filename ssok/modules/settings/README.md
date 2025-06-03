# Settings Module ⚙️

SSOK 앱의 사용자 설정 및 프로필 관리를 담당하는 모듈입니다. 개인정보 관리, 보안 설정, 알림 설정, 앱 환경설정 등 모든 사용자 맞춤 설정을 제공합니다.

## 주요 기능

- 👤 **프로필 관리**: 개인정보 수정 및 프로필 사진 관리
- 🔐 **보안 설정**: PIN 변경, 생체 인증 설정, 로그인 보안
- 🔔 **알림 설정**: 푸시 알림, 거래 알림, 마케팅 알림 관리
- 🎨 **앱 테마**: 다크모드, 테마 색상, 글꼴 크기 설정
- 🌐 **언어 설정**: 다국어 지원 및 지역 설정
- 💳 **계좌 설정**: 기본 계좌, 거래 한도, 자동 이체 설정
- 📱 **디바이스 관리**: 등록된 디바이스 목록 및 관리
- 🆘 **고객 지원**: FAQ, 문의하기, 버전 정보

## 구조

```
settings/
├── components/              # 설정 관련 컴포넌트
│   ├── ProfileSection.tsx          # 프로필 섹션
│   ├── SecuritySettings.tsx        # 보안 설정
│   ├── NotificationSettings.tsx    # 알림 설정
│   ├── ThemeSettings.tsx           # 테마 설정
│   ├── LanguageSettings.tsx        # 언어 설정
│   ├── AccountSettings.tsx         # 계좌 설정
│   ├── DeviceManager.tsx           # 디바이스 관리
│   ├── SupportSection.tsx          # 고객 지원
│   └── index.ts                    # 컴포넌트 exports
├── hooks/                   # 커스텀 훅
│   ├── useProfile.ts               # 프로필 관리 훅
│   ├── useSecuritySettings.ts      # 보안 설정 훅
│   ├── useTheme.ts                 # 테마 관리 훅
│   └── index.ts                    # 훅 exports
├── store/                   # 상태 관리
│   └── settingsStore.ts            # 설정 상태 스토어
├── api/                     # API 호출
│   ├── profileApi.ts               # 프로필 API
│   ├── settingsApi.ts              # 설정 API
│   └── types.ts                    # API 타입 정의
├── profile_api_spec.md      # API 명세서
└── index.ts                # 모듈 exports
```

## 사용법

### 1. 프로필 관리

```tsx
import { useProfile, ProfileSection } from '@/modules/settings';

export default function ProfileScreen() {
  const {
    profile,
    isLoading,
    updateProfile,
    uploadProfileImage
  } = useProfile();

  const handleProfileUpdate = async (updatedData) => {
    const result = await updateProfile(updatedData);
    if (result.success) {
      Toast.show({ type: 'success', text1: '프로필이 업데이트되었습니다.' });
    }
  };

  const handleImageUpload = async (imageUri) => {
    const result = await uploadProfileImage(imageUri);
    if (result.success) {
      Toast.show({ type: 'success', text1: '프로필 사진이 변경되었습니다.' });
    }
  };

  return (
    <ProfileSection
      profile={profile}
      isLoading={isLoading}
      onUpdate={handleProfileUpdate}
      onImageUpload={handleImageUpload}
    />
  );
}
```

### 2. 보안 설정

```tsx
import { SecuritySettings, useSecuritySettings } from '@/modules/settings';

export default function SecurityScreen() {
  const {
    securitySettings,
    updatePIN,
    toggleBiometric,
    updateSecuritySettings
  } = useSecuritySettings();

  const handlePINChange = async (oldPIN, newPIN) => {
    const result = await updatePIN(oldPIN, newPIN);
    if (result.success) {
      Toast.show({ type: 'success', text1: 'PIN이 변경되었습니다.' });
    }
  };

  return (
    <SecuritySettings
      settings={securitySettings}
      onPINChange={handlePINChange}
      onBiometricToggle={toggleBiometric}
      onSettingsUpdate={updateSecuritySettings}
    />
  );
}
```

### 3. 알림 설정

```tsx
import { NotificationSettings } from '@/modules/settings';

export default function NotificationScreen() {
  const { notificationSettings, updateNotificationSettings } = useSettingsStore();

  const handleNotificationToggle = async (type, enabled) => {
    const updatedSettings = {
      ...notificationSettings,
      [type]: enabled
    };
    await updateNotificationSettings(updatedSettings);
  };

  return (
    <NotificationSettings
      settings={notificationSettings}
      onToggle={handleNotificationToggle}
    />
  );
}
```

### 4. 테마 설정

```tsx
import { ThemeSettings, useTheme } from '@/modules/settings';

export default function ThemeScreen() {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    toggleDarkMode,
    setFontSize
  } = useTheme();

  return (
    <ThemeSettings
      currentTheme={currentTheme}
      availableThemes={availableThemes}
      onThemeChange={setTheme}
      onDarkModeToggle={toggleDarkMode}
      onFontSizeChange={setFontSize}
    />
  );
}
```

## API 명세

자세한 API 명세는 [profile_api_spec.md](./profile_api_spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `GET /profile`: 프로필 정보 조회
- `PUT /profile`: 프로필 정보 수정
- `POST /profile/avatar`: 프로필 사진 업로드
- `GET /settings`: 사용자 설정 조회
- `PUT /settings`: 사용자 설정 변경

## 상태 관리

### SettingsStore 상태

```typescript
interface SettingsState {
  // 프로필 정보
  profile: UserProfile | null;
  
  // 보안 설정
  securitySettings: SecuritySettings;
  
  // 알림 설정
  notificationSettings: NotificationSettings;
  
  // 앱 설정
  appSettings: AppSettings;
  
  // 테마 설정
  themeSettings: ThemeSettings;
  
  // 언어 설정
  languageSettings: LanguageSettings;
  
  // 로딩 상태
  isLoading: boolean;
  isUpdating: boolean;
  
  // 에러 처리
  error: string | null;
}
```

### 주요 액션

```typescript
interface SettingsActions {
  // 프로필 관리
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  uploadProfileImage: (imageUri: string) => Promise<boolean>;
  
  // 보안 설정
  updatePIN: (oldPIN: string, newPIN: string) => Promise<boolean>;
  toggleBiometric: (enabled: boolean) => Promise<boolean>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  
  // 알림 설정
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  
  // 앱 설정
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: ThemeType) => void;
  setLanguage: (language: string) => void;
  
  // 상태 관리
  clearError: () => void;
  resetSettings: () => void;
}
```

## 컴포넌트 상세

### ProfileSection

사용자 프로필 정보를 표시하고 수정할 수 있는 컴포넌트

**Props:**
- `profile: UserProfile` - 프로필 정보
- `isLoading: boolean` - 로딩 상태
- `onUpdate: (data: Partial<UserProfile>) => void` - 프로필 수정 핸들러
- `onImageUpload: (imageUri: string) => void` - 이미지 업로드 핸들러

### SecuritySettings

보안 관련 설정을 관리하는 컴포넌트

**Props:**
- `settings: SecuritySettings` - 보안 설정
- `onPINChange: (oldPIN: string, newPIN: string) => void` - PIN 변경 핸들러
- `onBiometricToggle: (enabled: boolean) => void` - 생체 인증 토글 핸들러
- `onSettingsUpdate: (settings: Partial<SecuritySettings>) => void` - 설정 업데이트 핸들러

### NotificationSettings

알림 설정을 관리하는 컴포넌트

**Props:**
- `settings: NotificationSettings` - 알림 설정
- `onToggle: (type: string, enabled: boolean) => void` - 알림 토글 핸들러

### ThemeSettings

앱 테마를 설정하는 컴포넌트

**Props:**
- `currentTheme: ThemeType` - 현재 테마
- `availableThemes: ThemeType[]` - 사용 가능한 테마 목록
- `onThemeChange: (theme: ThemeType) => void` - 테마 변경 핸들러
- `onDarkModeToggle: (enabled: boolean) => void` - 다크모드 토글 핸들러
- `onFontSizeChange: (size: FontSize) => void` - 글꼴 크기 변경 핸들러

## 설정 타입 정의

### SecuritySettings
```typescript
interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  autoLockTime: number; // 분 단위
  loginHistory: boolean;
  twoFactorAuth: boolean;
  deviceTrust: boolean;
}
```

### NotificationSettings
```typescript
interface NotificationSettings {
  pushEnabled: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  marketingAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
}
```

### AppSettings
```typescript
interface AppSettings {
  theme: ThemeType;
  language: string;
  fontSize: FontSize;
  hapticFeedback: boolean;
  soundEffects: boolean;
  currency: string;
  dateFormat: string;
  autoUpdate: boolean;
}
```

## 보안 고려사항

### 1. 민감한 정보 보호
- PIN 변경 시 기존 PIN 확인 필수
- 프로필 수정 시 재인증 요구
- 보안 설정 변경 로그 기록

### 2. 데이터 검증
- 입력값 서버사이드 검증
- 프로필 이미지 크기/형식 제한
- 설정값 범위 검증

### 3. 접근 제어
- 본인 계정 설정만 수정 가능
- 관리자 권한이 필요한 설정 분리
- 세션 유효성 검사

## 에러 처리

### 에러 타입
- `PROFILE_UPDATE_FAILED`: 프로필 업데이트 실패
- `INVALID_PIN`: 잘못된 PIN
- `IMAGE_UPLOAD_FAILED`: 이미지 업로드 실패
- `SETTINGS_SYNC_ERROR`: 설정 동기화 오류
- `PERMISSION_DENIED`: 권한 없음

### 사용자 친화적 에러 메시지
```typescript
const ERROR_MESSAGES = {
  PROFILE_UPDATE_FAILED: '프로필 업데이트에 실패했습니다. 다시 시도해주세요.',
  INVALID_PIN: '현재 PIN이 일치하지 않습니다.',
  IMAGE_UPLOAD_FAILED: '이미지 업로드에 실패했습니다. 다른 이미지를 선택해주세요.',
  SETTINGS_SYNC_ERROR: '설정 동기화에 실패했습니다. 인터넷 연결을 확인해주세요.',
};
```

## 테스트

### 단위 테스트
- 설정 유효성 검증 로직
- 프로필 데이터 포맷팅
- 테마 변경 로직

### 통합 테스트
- 프로필 업데이트 플로우
- 보안 설정 변경 플로우
- 알림 설정 동기화

### E2E 테스트
- 전체 설정 변경 시나리오
- 프로필 사진 업로드
- 테마 변경 적용

## 접근성

### 스크린 리더 지원
- 모든 설정 항목에 접근성 라벨 제공
- 상태 변경 시 음성 피드백
- 키보드 네비게이션 지원

### 시각적 접근성
- 충분한 색상 대비
- 글꼴 크기 조절 기능
- 고대비 모드 지원

## 성능 최적화

### 설정 캐싱
- 자주 사용하는 설정은 로컬 캐시
- 변경 시에만 서버 동기화
- 백그라운드에서 설정 미리 로드

### 이미지 최적화
- 프로필 이미지 압축
- 여러 해상도 이미지 생성
- CDN을 통한 이미지 서빙

## 의존성

### 외부 라이브러리
- `react-native-image-picker`: 이미지 선택
- `react-native-keychain`: 보안 저장
- `react-native-localize`: 지역화

### 내부 의존성
- `@/modules/auth`: 인증 확인
- `@/utils`: 공통 유틸리티
- `@/components`: 공통 UI 컴포넌트

---

**⚙️ 설정 관련 문의나 개선 사항이 있다면 사용자경험팀에 연락해주세요!** 