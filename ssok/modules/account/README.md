# Account Module 🏦

SSOK 앱의 계좌 및 금융 정보 관리를 담당하는 모듈입니다. 계좌 조회, 잔액 관리, 카드 정보 등 모든 금융 계정 관련 기능을 제공합니다.

## 주요 기능

- 💰 **계좌 잔액 조회**: 실시간 잔액 확인
- 📊 **계좌 목록 관리**: 여러 계좌 등록 및 관리
- 💳 **카드 정보 관리**: 등록된 카드 정보 조회/수정
- 📈 **거래 통계**: 월별/일별 거래 통계
- 🔒 **계좌 보안 설정**: 거래 한도 및 보안 설정
- 📱 **계좌 알림 설정**: 거래 알림 및 잔액 알림
- 🏪 **가맹점 관리**: 등록된 가맹점 정보
- 📋 **계좌 상세 정보**: 계좌번호, 개설일 등 상세 정보

## 구조

```
account/
├── components/              # 계좌 관련 컴포넌트
│   ├── AccountCard.tsx             # 계좌 카드 표시
│   ├── BalanceDisplay.tsx          # 잔액 표시
│   ├── TransactionChart.tsx        # 거래 차트
│   ├── CardManager.tsx             # 카드 관리
│   ├── AccountSettings.tsx         # 계좌 설정
│   └── index.ts                    # 컴포넌트 exports
├── stores/                  # 상태 관리
│   └── accountStore.ts             # 계좌 상태 스토어
├── api/                     # API 호출
│   ├── accountApi.ts               # 계좌 API 함수들
│   ├── cardApi.ts                  # 카드 API 함수들
│   └── types.ts                    # API 타입 정의
├── utils/                   # 유틸리티
│   ├── accountUtils.ts             # 계좌 관련 유틸리티
│   ├── balanceFormatter.ts         # 잔액 포맷팅
│   └── cardUtils.ts                # 카드 관련 유틸리티
├── constants/               # 상수 정의
│   ├── accountTypes.ts             # 계좌 타입 상수
│   └── cardTypes.ts                # 카드 타입 상수
├── assets/                  # 이미지, 아이콘
│   ├── icons/                      # 은행 로고 등
│   └── images/                     # 배경 이미지
├── accounts-api-spec.md     # API 명세서
└── index.ts                # 모듈 exports
```

## 사용법

### 1. 계좌 목록 조회

```tsx
import { useAccountStore, AccountCard } from '@/modules/account';

export default function AccountListScreen() {
  const {
    accounts,
    isLoading,
    loadAccounts,
    refreshBalance
  } = useAccountStore();

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleRefresh = async () => {
    await refreshBalance();
  };

  return (
    <FlatList
      data={accounts}
      renderItem={({ item }) => (
        <AccountCard
          account={item}
          onPress={() => navigateToDetail(item.id)}
          onRefresh={() => refreshBalance(item.id)}
        />
      )}
      onRefresh={handleRefresh}
      refreshing={isLoading}
    />
  );
}
```

### 2. 잔액 표시

```tsx
import { BalanceDisplay } from '@/modules/account';

export default function HomeScreen() {
  const { totalBalance, accounts } = useAccountStore();

  return (
    <View>
      <BalanceDisplay
        balance={totalBalance}
        accounts={accounts}
        showDetails={true}
        onAccountPress={handleAccountPress}
      />
    </View>
  );
}
```

### 3. 거래 통계

```tsx
import { TransactionChart, useAccountStore } from '@/modules/account';

export default function StatisticsScreen() {
  const {
    transactionStats,
    loadTransactionStats
  } = useAccountStore();

  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadTransactionStats(period);
  }, [period]);

  return (
    <View>
      <TransactionChart
        data={transactionStats}
        period={period}
        onPeriodChange={setPeriod}
      />
    </View>
  );
}
```

### 4. 카드 관리

```tsx
import { CardManager } from '@/modules/account';

export default function CardManagementScreen() {
  const {
    cards,
    loadCards,
    activateCard,
    deactivateCard,
    deleteCard
  } = useAccountStore();

  const handleCardToggle = async (cardId, isActive) => {
    if (isActive) {
      await deactivateCard(cardId);
    } else {
      await activateCard(cardId);
    }
  };

  return (
    <CardManager
      cards={cards}
      onCardToggle={handleCardToggle}
      onCardDelete={deleteCard}
      onAddCard={() => navigation.navigate('AddCard')}
    />
  );
}
```

## API 명세

자세한 API 명세는 [accounts-api-spec.md](./accounts-api-spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `GET /accounts`: 계좌 목록 조회
- `GET /accounts/{id}/balance`: 특정 계좌 잔액 조회
- `GET /cards`: 카드 목록 조회
- `PUT /cards/{id}/status`: 카드 상태 변경
- `GET /accounts/statistics`: 거래 통계 조회

## 상태 관리

### AccountStore 상태

```typescript
interface AccountState {
  // 계좌 정보
  accounts: Account[];
  selectedAccount: Account | null;
  totalBalance: number;
  
  // 카드 정보
  cards: Card[];
  activeCards: Card[];
  
  // 거래 통계
  transactionStats: TransactionStats | null;
  monthlyStats: MonthlyStats[];
  
  // 설정
  accountSettings: AccountSettings;
  notificationSettings: NotificationSettings;
  
  // 로딩 상태
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 에러 처리
  error: string | null;
}
```

### 주요 액션

```typescript
interface AccountActions {
  // 계좌 관리
  loadAccounts: () => Promise<void>;
  refreshBalance: (accountId?: string) => Promise<void>;
  selectAccount: (accountId: string) => void;
  addAccount: (accountData: NewAccountData) => Promise<boolean>;
  
  // 카드 관리
  loadCards: () => Promise<void>;
  activateCard: (cardId: string) => Promise<boolean>;
  deactivateCard: (cardId: string) => Promise<boolean>;
  deleteCard: (cardId: string) => Promise<boolean>;
  
  // 통계
  loadTransactionStats: (period: StatsPeriod) => Promise<void>;
  
  // 설정
  updateAccountSettings: (settings: Partial<AccountSettings>) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  
  // 상태 관리
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}
```

## 컴포넌트 상세

### AccountCard

개별 계좌 정보를 카드 형태로 표시하는 컴포넌트

**Props:**
- `account: Account` - 계좌 정보
- `onPress: () => void` - 카드 터치 핸들러
- `onRefresh?: () => void` - 새로고침 핸들러
- `showBalance?: boolean` - 잔액 표시 여부

### BalanceDisplay

총 잔액 및 계좌별 잔액을 표시하는 컴포넌트

**Props:**
- `balance: number` - 표시할 잔액
- `accounts?: Account[]` - 계좌 목록 (상세 표시용)
- `showDetails?: boolean` - 상세 정보 표시 여부
- `onAccountPress?: (account: Account) => void` - 계좌 선택 핸들러

### TransactionChart

거래 통계를 차트로 표시하는 컴포넌트

**Props:**
- `data: TransactionStats` - 통계 데이터
- `period: StatsPeriod` - 통계 기간
- `onPeriodChange: (period: StatsPeriod) => void` - 기간 변경 핸들러

### CardManager

등록된 카드들을 관리하는 컴포넌트

**Props:**
- `cards: Card[]` - 카드 목록
- `onCardToggle: (cardId: string, isActive: boolean) => void` - 카드 활성화/비활성화
- `onCardDelete: (cardId: string) => void` - 카드 삭제
- `onAddCard: () => void` - 새 카드 추가

## 유틸리티 함수

### 잔액 포맷팅
```typescript
// 잔액을 사용자 친화적 형태로 포맷팅
export const formatBalance = (balance: number, showCurrency = true): string => {
  const formatted = new Intl.NumberFormat('ko-KR').format(balance);
  return showCurrency ? `${formatted}원` : formatted;
};

// 간단한 잔액 표시 (예: 1.2만원)
export const formatBalanceSimple = (balance: number): string => {
  if (balance >= 100000000) {
    return `${(balance / 100000000).toFixed(1)}억원`;
  } else if (balance >= 10000) {
    return `${(balance / 10000).toFixed(1)}만원`;
  } else {
    return `${balance.toLocaleString()}원`;
  }
};
```

### 계좌 유틸리티
```typescript
// 계좌번호 마스킹
export const maskAccountNumber = (accountNumber: string): string => {
  const length = accountNumber.length;
  if (length <= 4) return accountNumber;
  
  const start = accountNumber.substring(0, 3);
  const end = accountNumber.substring(length - 4);
  const masked = '*'.repeat(length - 7);
  
  return `${start}${masked}${end}`;
};

// 계좌 타입별 아이콘
export const getAccountIcon = (accountType: AccountType): string => {
  const iconMap = {
    CHECKING: 'wallet',
    SAVINGS: 'piggy-bank',
    INVESTMENT: 'trending-up',
    FOREIGN: 'globe',
  };
  return iconMap[accountType] || 'account-balance';
};
```

## 보안 고려사항

### 1. 데이터 보호
- 계좌번호 마스킹 처리
- 잔액 정보 암호화 저장
- 민감한 정보 로깅 금지

### 2. 접근 제어
- PIN 인증 후 계좌 정보 조회
- 생체 인증으로 추가 보안
- 세션 타임아웃 적용

### 3. API 보안
- 요청 시 토큰 검증
- 계좌 소유권 확인
- Rate limiting 적용

## 에러 처리

### 에러 타입
- `ACCOUNT_NOT_FOUND`: 계좌를 찾을 수 없음
- `INSUFFICIENT_PERMISSION`: 권한 부족
- `NETWORK_ERROR`: 네트워크 연결 오류
- `BALANCE_FETCH_ERROR`: 잔액 조회 실패
- `CARD_OPERATION_ERROR`: 카드 작업 실패

### 에러 복구 전략
```typescript
const errorRecoveryMap = {
  ACCOUNT_NOT_FOUND: () => reloadAccountList(),
  NETWORK_ERROR: () => retryWithBackoff(),
  BALANCE_FETCH_ERROR: () => showCachedBalance(),
  CARD_OPERATION_ERROR: () => refreshCardStatus(),
};
```

## 캐싱 전략

### 데이터 캐싱
- 계좌 목록: 1시간 캐시
- 잔액 정보: 5분 캐시
- 거래 통계: 1일 캐시

### 캐시 무효화
- 거래 발생 시 잔액 캐시 무효화
- 계좌 설정 변경 시 관련 캐시 무효화
- 앱 포그라운드 진입 시 선택적 새로고침

## 테스트

### 단위 테스트
- 잔액 포맷팅 함수
- 계좌 유틸리티 함수
- API 호출 함수

### 통합 테스트
- 계좌 목록 로딩
- 잔액 새로고침
- 카드 상태 변경

### E2E 테스트
- 계좌 조회 플로우
- 카드 관리 플로우
- 통계 확인 플로우

## 성능 최적화

### 리스트 최적화
- FlatList 가상화 사용
- 아이템 메모이제이션
- 이미지 lazy loading

### 데이터 로딩
- 필요한 데이터만 로드
- 백그라운드 새로고침
- 프리페칭 활용

## 의존성

### 외부 라이브러리
- `react-native-charts-kit`: 차트 표시
- `react-native-keychain`: 보안 저장
- `date-fns`: 날짜 처리

### 내부 의존성
- `@/modules/auth`: 인증 정보
- `@/utils`: 공통 유틸리티
- `@/components`: 공통 UI 컴포넌트

---

**🏦 계좌 관련 문의나 데이터 문제가 있다면 백엔드팀에 연락해주세요!** 