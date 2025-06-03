# App Directory 📱

SSOK 앱의 화면 구조와 네비게이션을 정의하는 디렉토리입니다. Expo Router를 사용한 file-based routing 시스템으로 구성되어 있습니다.

## 📁 구조

```
app/
├── (auth)/                  # 인증 관련 화면들
│   ├── register.tsx               # 회원가입
│   ├── pin-setup.tsx              # PIN 설정
│   ├── pin-confirm.tsx            # PIN 확인
│   ├── pin-login.tsx              # PIN 로그인
│   └── _layout.tsx                # 인증 레이아웃
├── (app)/                   # 메인 앱 화면들
│   ├── (tabs)/                    # 탭 네비게이션 화면들
│   │   ├── index.tsx              # 홈 화면
│   │   ├── transfer.tsx           # 송금 화면
│   │   ├── history.tsx            # 거래 내역
│   │   ├── account.tsx            # 계좌 관리
│   │   └── _layout.tsx            # 탭 레이아웃
│   ├── transfer/                  # 송금 관련 상세 화면들
│   │   ├── confirm.tsx            # 송금 확인
│   │   ├── success.tsx            # 송금 완료
│   │   └── qr-scan.tsx            # QR 스캔
│   ├── account/                   # 계좌 관련 상세 화면들
│   │   ├── details.tsx            # 계좌 상세
│   │   └── card-management.tsx    # 카드 관리
│   ├── index.tsx                  # 앱 진입점
│   └── _layout.tsx                # 앱 레이아웃
├── __tests__/               # 테스트 파일들
├── reauth.tsx               # 재인증 화면
├── sign-in.tsx              # 로그인 화면
└── _layout.tsx              # 루트 레이아웃
```

## 🎯 화면별 상세 설명

### 루트 레벨 (_layout.tsx)
앱의 최상위 레이아웃으로 전체 앱의 네비게이션 구조를 정의합니다.

**주요 기능:**
- 인증 상태에 따른 화면 분기
- 글로벌 상태 프로바이더 설정
- 테마 및 스타일 설정
- 딥링크 처리

### 인증 화면들 ((auth)/)

#### register.tsx - 회원가입
**기능:**
- 개인정보 입력 (이름, 생년월일)
- 휴대폰 번호 인증
- SMS 인증번호 확인
- 서비스 이용약관 동의

**플로우:**
1. 개인정보 입력
2. 휴대폰 번호 입력 → SMS 발송
3. 인증번호 입력 → 확인
4. 약관 동의 → PIN 설정 화면으로 이동

#### pin-setup.tsx - PIN 설정
**기능:**
- 6자리 PIN 번호 설정
- PIN 재입력 확인
- 생체 인증 활성화 옵션

#### pin-confirm.tsx - PIN 확인
**기능:**
- PIN 재입력으로 확인
- 일치 여부 검증
- 회원가입 완료 처리

#### pin-login.tsx - PIN 로그인
**기능:**
- 기존 사용자 PIN 입력
- 생체 인증 옵션
- 로그인 실패 시 재시도 제한

### 메인 앱 화면들 ((app)/)

#### index.tsx - 앱 진입점
**기능:**
- 인증 상태 확인
- 온보딩 필요 여부 체크
- 적절한 화면으로 리다이렉트

#### 탭 네비게이션 ((tabs)/)

##### index.tsx - 홈 화면
**기능:**
- 계좌 잔액 표시
- 빠른 액션 버튼들 (송금, QR결제)
- 최근 거래 내역 미리보기
- 블루투스 연결 상태
- 공지사항 및 프로모션

**컴포넌트 구성:**
```tsx
<ScrollView>
  <AccountBalanceCard />
  <QuickActionButtons />
  <RecentTransactions />
  <BluetoothStatus />
  <NotificationBanner />
</ScrollView>
```

##### transfer.tsx - 송금 화면
**기능:**
- 송금 대상 선택
- 금액 입력
- 송금 메모 작성
- PIN 인증

##### history.tsx - 거래 내역
**기능:**
- 거래 내역 목록 표시
- 날짜별/타입별 필터링
- 무한 스크롤 페이지네이션
- 상세 거래 정보 조회

##### account.tsx - 계좌 관리
**기능:**
- 등록된 계좌 목록
- 계좌별 잔액 조회
- 새 계좌 등록
- 계좌 설정 관리

#### 송금 상세 화면들 (transfer/)

##### confirm.tsx - 송금 확인
**기능:**
- 송금 정보 최종 확인
- 수수료 표시
- PIN 인증 요청
- 송금 실행

##### success.tsx - 송금 완료
**기능:**
- 송금 성공 메시지
- 거래 영수증 표시
- 공유 기능
- 홈으로 돌아가기

##### qr-scan.tsx - QR 스캔
**기능:**
- QR 코드 스캔
- 결제 정보 파싱
- 결제 확인 화면 이동

#### 계좌 상세 화면들 (account/)

##### details.tsx - 계좌 상세
**기능:**
- 계좌 잔액 및 정보
- 거래 내역
- 계좌 설정 변경

##### card-management.tsx - 카드 관리
**기능:**
- 등록된 카드 목록
- 카드 활성화/비활성화
- 새 카드 등록
- 카드 설정 변경

### 기타 화면들

#### reauth.tsx - 재인증
**기능:**
- 세션 만료 시 재인증
- 보안이 필요한 작업 전 인증
- PIN 또는 생체 인증

#### sign-in.tsx - 로그인
**기능:**
- 기존 사용자 로그인
- 회원가입 링크
- 비회원 체험 모드

## 🧭 네비게이션 구조

### 인증 플로우
```
sign-in → register → pin-setup → pin-confirm → (app)
   ↓         ↓
pin-login   reauth
```

### 메인 앱 플로우
```
(app)/index → (tabs) [홈, 송금, 내역, 계좌]
                ↓
            세부 화면들 (transfer/, account/)
```

## 🎨 레이아웃 시스템

### 루트 레이아웃 (_layout.tsx)
```tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="reauth" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### 인증 레이아웃 ((auth)/_layout.tsx)
```tsx
export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      gestureEnabled: false, // 뒤로가기 제스처 비활성화
    }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="pin-setup" />
      <Stack.Screen name="pin-confirm" />
      <Stack.Screen name="pin-login" />
    </Stack>
  );
}
```

### 탭 레이아웃 ((app)/(tabs)/_layout.tsx)
```tsx
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { 
        backgroundColor: colors.white,
        borderTopColor: colors.border,
      }
    }}>
      <Tabs.Screen name="index" options={{
        title: '홈',
        tabBarIcon: ({ color }) => <HomeIcon color={color} />
      }} />
      <Tabs.Screen name="transfer" options={{
        title: '송금',
        tabBarIcon: ({ color }) => <TransferIcon color={color} />
      }} />
      <Tabs.Screen name="history" options={{
        title: '내역',
        tabBarIcon: ({ color }) => <HistoryIcon color={color} />
      }} />
      <Tabs.Screen name="account" options={{
        title: '계좌',
        tabBarIcon: ({ color }) => <AccountIcon color={color} />
      }} />
    </Tabs>
  );
}
```

## 🔐 보안 및 인증

### 화면별 보안 레벨
- **Public**: sign-in, register
- **Auth Required**: (app) 내 모든 화면
- **Enhanced Security**: transfer 관련 화면, reauth

### 인증 가드
```tsx
// 인증이 필요한 화면에서 사용
const ProtectedScreen = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }
  
  return <ActualScreen />;
};
```

## 📱 화면 상태 관리

### 전역 상태
- 인증 상태 (AuthStore)
- 계좌 정보 (AccountStore)
- 거래 데이터 (TransferStore)

### 로컬 상태
- 폼 입력값
- UI 상태 (로딩, 에러)
- 모달/바텀시트 표시 여부

## 🎯 사용자 경험 (UX)

### 네비게이션 패턴
- **스택 네비게이션**: 순차적 플로우 (회원가입, 송금)
- **탭 네비게이션**: 주요 기능 간 빠른 전환
- **모달**: 임시 작업 (PIN 입력, 확인 다이얼로그)

### 애니메이션 및 전환
- 부드러운 화면 전환
- 로딩 상태 표시
- 성공/실패 피드백

### 접근성
- 스크린 리더 지원
- 적절한 터치 영역 크기
- 색상 대비 준수

## 🧪 테스트 전략

### 화면별 테스트
- 컴포넌트 렌더링 테스트
- 사용자 인터랙션 테스트
- 네비게이션 플로우 테스트

### E2E 테스트
- 회원가입 전체 플로우
- 송금 완료까지의 전 과정
- 인증 실패 시나리오

## 📝 개발 가이드라인

### 새 화면 추가 시
1. 적절한 디렉토리에 파일 생성
2. 타입 안전한 파라미터 정의
3. 레이아웃에 화면 등록
4. 테스트 코드 작성

### 네비게이션 파라미터
```typescript
// app/types/navigation.ts
export type RootStackParamList = {
  '(auth)': undefined;
  '(app)': undefined;
  'sign-in': undefined;
  'reauth': { requiredFor: string };
};

export type AppStackParamList = {
  '(tabs)': undefined;
  'transfer/confirm': { transferData: TransferData };
  'transfer/success': { transactionId: string };
};
```

## 🚀 성능 최적화

### 코드 분할
- 라우트별 lazy loading
- 조건부 컴포넌트 로딩

### 메모리 관리
- 불필요한 상태 정리
- 이미지 캐싱 최적화
- 백그라운드 작업 제한

---

**📱 앱 구조나 네비게이션 관련 문의가 있다면 프론트엔드팀에 연락해주세요!** 