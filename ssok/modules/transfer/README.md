# Transfer Module 💰

SSOK 앱의 송금 및 결제 기능을 담당하는 모듈입니다. 계좌 간 송금, QR 코드 결제, 거래 내역 관리 등 모든 금융 거래 기능을 제공합니다.

## 주요 기능

- 💸 **계좌 간 송금**: 다른 계좌로 금액 송금
- 📱 **QR 코드 결제**: QR 스캔을 통한 간편 결제
- 💳 **카드 결제**: 실물 카드를 통한 결제
- 📊 **거래 내역**: 송금/결제 기록 관리
- 🔐 **PIN 인증**: 거래 시 PIN 번호 확인
- 📄 **영수증 관리**: 거래 영수증 생성/저장
- 🔔 **거래 알림**: 실시간 거래 알림
- 💹 **한도 관리**: 일일/월간 거래 한도 설정

## 구조

```
transfer/
├── components/              # 송금/결제 관련 컴포넌트
│   ├── TransferForm.tsx            # 송금 폼
│   ├── QRScanner.tsx               # QR 스캔 화면
│   ├── PaymentConfirm.tsx          # 결제 확인 화면
│   ├── TransactionHistory.tsx      # 거래 내역
│   ├── ReceiptViewer.tsx           # 영수증 뷰어
│   └── index.ts                    # 컴포넌트 exports
├── hooks/                   # 커스텀 훅
│   ├── useTransfer.ts              # 송금 로직
│   ├── useQRPayment.ts             # QR 결제 로직
│   ├── useTransactionHistory.ts    # 거래 내역 관리
│   └── index.ts                    # 훅 exports
├── stores/                  # 상태 관리
│   └── transferStore.ts            # 송금/결제 상태 스토어
├── api/                     # API 호출
│   ├── transferApi.ts              # 송금 API 함수들
│   ├── paymentApi.ts               # 결제 API 함수들
│   └── types.ts                    # API 타입 정의
├── utils/                   # 유틸리티
│   ├── qrUtils.ts                  # QR 코드 관련 유틸리티
│   ├── amountUtils.ts              # 금액 계산 유틸리티
│   └── receiptUtils.ts             # 영수증 생성 유틸리티
├── types/                   # 타입 정의
│   └── index.ts                    # 송금/결제 타입들
├── assets/                  # 이미지, 아이콘
│   ├── icons/                      # 결제 관련 아이콘
│   └── images/                     # 배경 이미지 등
├── transfer-api-spec.md     # API 명세서
└── index.ts                # 모듈 exports
```

## 사용법

### 1. 계좌 간 송금

```tsx
import { useTransfer, TransferForm } from '@/modules/transfer';

export default function TransferScreen() {
  const {
    transferData,
    isLoading,
    error,
    validateAmount,
    processTransfer,
    updateTransferData
  } = useTransfer();

  const handleTransfer = async () => {
    const isValid = await validateAmount(transferData.amount);
    if (isValid) {
      const result = await processTransfer(transferData);
      if (result.success) {
        navigation.navigate('TransferSuccess', { 
          transactionId: result.transactionId 
        });
      }
    }
  };

  return (
    <View>
      <TransferForm
        transferData={transferData}
        onUpdateData={updateTransferData}
        onTransfer={handleTransfer}
        isLoading={isLoading}
        error={error}
      />
    </View>
  );
}
```

### 2. QR 코드 결제

```tsx
import { useQRPayment, QRScanner } from '@/modules/transfer';

export default function QRPaymentScreen() {
  const {
    isScanning,
    paymentData,
    processQRPayment,
    startScanning,
    stopScanning
  } = useQRPayment();

  const handleQRScanned = async (qrData) => {
    stopScanning();
    const result = await processQRPayment(qrData);
    if (result.success) {
      navigation.navigate('PaymentSuccess');
    }
  };

  return (
    <View>
      <QRScanner
        isScanning={isScanning}
        onQRScanned={handleQRScanned}
        onStartScan={startScanning}
        onStopScan={stopScanning}
      />
      {paymentData && (
        <PaymentConfirm
          paymentData={paymentData}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
      )}
    </View>
  );
}
```

### 3. 거래 내역 조회

```tsx
import { useTransactionHistory, TransactionHistory } from '@/modules/transfer';

export default function HistoryScreen() {
  const {
    transactions,
    isLoading,
    hasMore,
    loadTransactions,
    loadMoreTransactions,
    filterTransactions
  } = useTransactionHistory();

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleFilter = (filterType, dateRange) => {
    filterTransactions({ type: filterType, dateRange });
  };

  return (
    <View>
      <TransactionHistory
        transactions={transactions}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMoreTransactions}
        onFilter={handleFilter}
      />
    </View>
  );
}
```

## API 명세

자세한 API 명세는 [transfer-api-spec.md](./transfer-api-spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `POST /transfer/send`: 송금 실행
- `POST /payment/qr`: QR 결제 처리
- `GET /transactions/history`: 거래 내역 조회
- `POST /payment/confirm`: 결제 확인
- `GET /transfer/limits`: 거래 한도 조회

## 상태 관리

### TransferStore 상태

```typescript
interface TransferState {
  // 송금 상태
  transferData: TransferData | null;
  isTransferring: boolean;
  
  // 결제 상태
  paymentData: PaymentData | null;
  isProcessingPayment: boolean;
  
  // QR 스캔 상태
  isQRScanning: boolean;
  scannedQRData: QRData | null;
  
  // 거래 내역
  transactions: Transaction[];
  isLoadingHistory: boolean;
  hasMoreTransactions: boolean;
  
  // 한도 관리
  dailyLimit: number;
  monthlyLimit: number;
  usedDailyAmount: number;
  usedMonthlyAmount: number;
  
  // 에러 처리
  error: string | null;
}
```

### 주요 액션

```typescript
interface TransferActions {
  // 송금 기능
  processTransfer: (data: TransferData) => Promise<TransferResult>;
  validateAmount: (amount: number) => Promise<boolean>;
  updateTransferData: (data: Partial<TransferData>) => void;
  
  // QR 결제
  processQRPayment: (qrData: QRData) => Promise<PaymentResult>;
  startQRScanning: () => void;
  stopQRScanning: () => void;
  
  // 거래 내역
  loadTransactions: (params?: TransactionParams) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  filterTransactions: (filter: TransactionFilter) => void;
  
  // 한도 관리
  checkDailyLimit: (amount: number) => boolean;
  checkMonthlyLimit: (amount: number) => boolean;
  
  // 상태 관리
  clearError: () => void;
  resetTransferData: () => void;
}
```

## 컴포넌트 상세

### TransferForm

송금 정보 입력 폼 컴포넌트

**Props:**
- `transferData: TransferData` - 송금 데이터
- `onUpdateData: (data: Partial<TransferData>) => void` - 데이터 업데이트 핸들러
- `onTransfer: () => void` - 송금 실행 핸들러
- `isLoading: boolean` - 로딩 상태
- `error?: string` - 에러 메시지

### QRScanner

QR 코드 스캔 컴포넌트

**Props:**
- `isScanning: boolean` - 스캔 진행 상태
- `onQRScanned: (data: QRData) => void` - QR 스캔 완료 핸들러
- `onStartScan: () => void` - 스캔 시작 핸들러
- `onStopScan: () => void` - 스캔 중지 핸들러

### PaymentConfirm

결제 확인 컴포넌트

**Props:**
- `paymentData: PaymentData` - 결제 정보
- `onConfirm: () => void` - 결제 확인 핸들러
- `onCancel: () => void` - 결제 취소 핸들러
- `isLoading?: boolean` - 처리 중 상태

### TransactionHistory

거래 내역 목록 컴포넌트

**Props:**
- `transactions: Transaction[]` - 거래 내역 목록
- `isLoading: boolean` - 로딩 상태
- `hasMore: boolean` - 추가 데이터 존재 여부
- `onLoadMore: () => void` - 더 불러오기 핸들러
- `onFilter: (filter: TransactionFilter) => void` - 필터 핸들러

## 보안 고려사항

### 1. 거래 인증
- PIN 번호 확인 필수
- 생체 인증 옵션 제공
- 이중 인증 (2FA) 지원

### 2. 데이터 암호화
- 송금 정보 AES-256 암호화
- API 통신 HTTPS 강제
- 민감한 데이터 메모리에서 즉시 삭제

### 3. 한도 관리
- 일일/월간 거래 한도 설정
- 고액 거래 시 추가 인증
- 의심스러운 거래 패턴 감지

### 4. 부정 거래 방지
- 거래 패턴 분석
- 실시간 사기 탐지
- 비정상 접근 차단

## 에러 처리

### 에러 타입
- `INSUFFICIENT_BALANCE`: 잔액 부족
- `DAILY_LIMIT_EXCEEDED`: 일일 한도 초과
- `MONTHLY_LIMIT_EXCEEDED`: 월간 한도 초과
- `INVALID_ACCOUNT`: 유효하지 않은 계좌
- `NETWORK_ERROR`: 네트워크 연결 오류
- `AUTHENTICATION_FAILED`: 인증 실패
- `QR_PARSE_ERROR`: QR 코드 파싱 오류

### 에러 복구
```typescript
const errorRecoveryMap = {
  INSUFFICIENT_BALANCE: () => showBalanceInfo(),
  DAILY_LIMIT_EXCEEDED: () => showLimitInfo(),
  NETWORK_ERROR: () => retryWithExponentialBackoff(),
  AUTHENTICATION_FAILED: () => requestReauthentication(),
};
```

## 유틸리티 함수

### 금액 관련
```typescript
// 금액 포맷팅
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

// 수수료 계산
export const calculateFee = (amount: number, type: TransferType): number => {
  const feeRates = {
    INTERNAL: 0, // 내부 송금 무료
    EXTERNAL: 0.001, // 외부 송금 0.1%
    QR_PAYMENT: 0, // QR 결제 무료
  };
  return amount * (feeRates[type] || 0);
};
```

### QR 코드 관련
```typescript
// QR 데이터 파싱
export const parseQRData = (qrString: string): QRData => {
  try {
    const data = JSON.parse(qrString);
    return {
      merchantId: data.mid,
      amount: data.amount,
      description: data.desc,
      timestamp: data.ts,
    };
  } catch (error) {
    throw new Error('INVALID_QR_FORMAT');
  }
};

// QR 코드 생성
export const generateQRData = (paymentInfo: PaymentInfo): string => {
  return JSON.stringify({
    mid: paymentInfo.merchantId,
    amount: paymentInfo.amount,
    desc: paymentInfo.description,
    ts: Date.now(),
  });
};
```

## 테스트

### 단위 테스트
- 금액 계산 로직
- QR 데이터 파싱
- 한도 검증 함수

### 통합 테스트
- 송금 플로우
- QR 결제 플로우
- 거래 내역 로딩

### E2E 테스트
- 전체 송금 시나리오
- QR 스캔부터 결제 완료까지
- 에러 상황 처리

## 성능 최적화

### 거래 내역 최적화
- 가상화된 리스트 사용
- 페이지네이션으로 메모리 절약
- 이미지 lazy loading

### QR 스캔 최적화
- 카메라 미리보기 최적화
- QR 인식 빈도 조절
- 배터리 사용량 최소화

## 의존성

### 외부 라이브러리
- `react-native-camera`: QR 스캔
- `react-native-qrcode-generator`: QR 생성
- `react-native-keychain`: 보안 저장
- `date-fns`: 날짜 처리

### 내부 의존성
- `@/modules/auth`: 인증 정보
- `@/modules/account`: 계좌 정보
- `@/components`: 공통 UI 컴포넌트
- `@/utils`: 공통 유틸리티

---

**💰 송금/결제 관련 문의나 보안 이슈가 있다면 금융보안팀에 연락해주세요!** 