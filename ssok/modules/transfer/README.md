# Transfer Module 💸

SSOK 앱의 송금 및 결제를 담당하는 모듈입니다. 일반 계좌 송금과 블루투스 송금 두 가지 방식을 지원하며, 단계별 플로우로 안전하고 직관적인 송금 경험을 제공합니다.

## 주요 기능

- 💰 **일반 계좌 송금**: 은행명, 계좌번호를 통한 전통적인 송금
- 📶 **블루투스 송금**: UUID를 통한 계좌 정보 없는 송금
- 🎯 **단계별 플로우**: 계좌선택 → 금액입력 → 확인 → 완료 단계
- 🔍 **실명 조회**: 송금 전 계좌 실명 확인
- 📋 **거래 내역**: 송금 결과 및 이력 관리
- 🎨 **직관적 UI**: 단계별 애니메이션과 명확한 안내
- 🔒 **PIN 인증**: 송금 시 PIN을 통한 보안 확인

## 구조

```
transfer/
├── components/              # 송금 관련 컴포넌트
│   ├── TransferFlow.tsx             # 메인 송금 플로우 관리
│   ├── steps/                       # 단계별 컴포넌트
│   │   ├── AccountStep.tsx          # 계좌 입력 단계
│   │   ├── AmountStep.tsx           # 금액 입력 단계
│   │   └── CompleteStep.tsx         # 송금 완료 단계
│   ├── TransferKeypad.tsx           # 숫자 키패드
│   ├── BankSelector.tsx             # 은행 선택기
│   ├── BankSelectModal.tsx          # 은행 선택 모달
│   ├── AmountDisplay.tsx            # 금액 표시
│   ├── AmountHeader.tsx             # 금액 헤더
│   ├── AccountInput.tsx             # 계좌번호 입력
│   ├── ConfirmButton.tsx            # 확인 버튼
│   ├── ConfirmQuestion.tsx          # 확인 질문
│   ├── CompleteMessage.tsx          # 완료 메시지
│   ├── TransactionDetailsCard.tsx   # 거래 상세 카드
│   ├── NextButton.tsx               # 다음 버튼
│   └── AnimatedLayout.tsx           # 애니메이션 레이아웃
├── stores/                  # 상태 관리
│   └── transferStore.ts             # 송금 상태 스토어
├── api/                     # API 호출
│   └── transferApi.ts               # 송금 API 함수들
├── types/                   # 타입 정의
│   └── transferFlow.ts              # 송금 플로우 타입
├── utils/                   # 유틸리티
│   └── transferUtils.ts             # 송금 관련 유틸리티
├── assets/                  # 에셋
│   └── loading.gif                  # 로딩 애니메이션
├── transfer-api-spec.md     # API 명세서
└── README.md                # 모듈 문서
```

## 사용법

### 1. 송금 플로우 화면

```tsx
import { TransferFlow } from '@/modules/transfer';

export default function TransferScreen() {
  const { accountId, uuid, userName, bankName, isBluetooth } = useLocalSearchParams();

  // 블루투스 송금인 경우 초기 데이터 설정
  const initialData = {};
  if (isBluetooth === 'true') {
    const selectedBank = banks.find(bank => bank.name === bankName) || banks[0];
    initialData = {
      uuid: uuid as string,
      userName: userName as string,
      selectedBank: selectedBank,
      isBluetoothTransfer: true,
    };
  }

  return (
    <TransferFlow
      sourceAccountId={accountId as string}
      initialStep={isBluetooth === 'true' ? 'amount' : 'account'}
      initialData={initialData}
    />
  );
}
```

### 2. 단계별 컴포넌트 사용

```tsx
import { AccountStep, AmountStep, CompleteStep } from '@/modules/transfer/components/steps';

// 계좌 정보 입력 단계
<AccountStep
  data={transferData}
  onNext={(data) => handleStepNext('amount', data)}
  onBack={() => handleStepBack()}
/>

// 금액 입력 단계
<AmountStep
  data={transferData}
  onNext={(data) => handleStepNext('confirm', data)}
  onBack={() => handleStepBack()}
/>

// 송금 완료 단계
<CompleteStep
  data={transferData}
  onBack={() => handleStepBack()}
/>
```

### 3. 송금 스토어 사용

```tsx
import { useTransferStore } from '@/modules/transfer/stores';

export default function TransferManager() {
  const {
    sendMoney,
    sendMoneyBluetooth,
    getTransferHistory,
    processTransfer,
    isLoading,
    lastTransfer,
    error
  } = useTransferStore();

  // 일반 송금
  const handleRegularTransfer = async (data) => {
    const result = await sendMoney({
      sendAccountId: data.sendAccountId,
      sendBankCode: data.sendBankCode,
      sendName: data.senderName,
      recvAccountNumber: data.accountNumber,
      recvBankCode: data.bankCode,
      recvName: data.userName,
      amount: data.amount
    });

    if (result.success) {
      console.log('송금 성공:', result.data);
    }
  };

  // 블루투스 송금
  const handleBluetoothTransfer = async (data) => {
    const result = await sendMoneyBluetooth({
      sendAccountId: data.sendAccountId,
      sendBankCode: data.sendBankCode,
      sendName: data.senderName,
      recvUuid: data.uuid,
      amount: data.amount
    });

    if (result.success) {
      console.log('블루투스 송금 성공:', result.data);
    }
  };

  // 통합 송금 처리
  const handleTransfer = async (transferData) => {
    const result = await processTransfer(transferData);
    return result;
  };
}
```

## API 명세

자세한 API 명세는 [transfer-api-spec.md](./transfer-api-spec.md)를 참조하세요.

### 주요 API 엔드포인트

- `POST /api/transfers/openbank`: 일반 계좌 송금
- `POST /api/bluetooth/transfers`: 블루투스 송금
- `GET /api/transfers/histories`: 송금 내역 조회
- `GET /api/transfers/history`: 최근 송금 내역 조회

## 상태 관리

### TransferStore 상태

```typescript
interface TransferState {
  // 송금 상태
  isLoading: boolean;
  error: string | null;
  lastTransfer: TransferResponse | null;
  
  // 거래 내역
  transferHistory: TransferHistory[];
  recentHistory: RecentTransferHistory[];
}
```

### 주요 액션

```typescript
interface TransferActions {
  // 송금 실행
  sendMoney: (data: TransferRequest) => Promise<ServiceResponse<TransferResponse>>;
  sendMoneyBluetooth: (data: BluetoothTransferRequest) => Promise<ServiceResponse<TransferResponse>>;
  processTransfer: (data: TransferProcessData) => Promise<ServiceResponse<TransferResponse>>;
  
  // 거래 내역
  getTransferHistory: (accountId: number) => Promise<ServiceResponse<TransferHistory[]>>;
  getRecentTransferHistory: () => Promise<ServiceResponse<RecentTransferHistory[]>>;
  
  // 상태 관리
  clearError: () => void;
  resetTransfer: () => void;
}
```

## 컴포넌트 상세

### TransferFlow

송금 전체 플로우를 관리하는 메인 컴포넌트

**Props:**
- `sourceAccountId?: string` - 출금 계좌 ID
- `initialStep?: TransferStep` - 시작 단계
- `initialData?: Partial<TransferFlowData>` - 초기 데이터

**Features:**
- 단계별 네비게이션 관리
- 데이터 상태 통합 관리
- 애니메이션 전환 처리

### AccountStep

계좌 정보 입력 단계 컴포넌트

**Props:**
- `data: TransferFlowData` - 현재 플로우 데이터
- `onNext: (data: TransferFlowData) => void` - 다음 단계 핸들러
- `onBack?: () => void` - 이전 단계 핸들러

**Features:**
- 은행 선택 모달
- 계좌번호 입력 및 검증
- 실명 조회 기능
- 입력값 유효성 검사

### AmountStep

금액 입력 단계 컴포넌트

**Props:**
- `data: TransferFlowData` - 현재 플로우 데이터
- `onNext: (data: TransferFlowData) => void` - 다음 단계 핸들러
- `onBack?: () => void` - 이전 단계 핸들러

**Features:**
- 숫자 키패드 입력
- 금액 포맷팅 표시
- 최대/최소 금액 검증
- 잔액 확인

### CompleteStep

송금 실행 및 완료 단계 컴포넌트

**Props:**
- `data: TransferFlowData` - 송금 데이터
- `onBack?: () => void` - 이전 단계 핸들러

**Features:**
- 송금 실행 처리
- 로딩 애니메이션
- 성공/실패 결과 표시
- 결과에 따른 액션 버튼

### TransferKeypad

숫자 입력을 위한 키패드 컴포넌트

**Props:**
- `onPress: (key: string) => void` - 키 입력 핸들러
- `onDelete: () => void` - 삭제 핸들러
- `disabled?: boolean` - 비활성화 상태

**Features:**
- 0-9 숫자 키
- 백스페이스 키
- 터치 피드백
- 접근성 지원

### BankSelector

은행 선택을 위한 컴포넌트

**Props:**
- `selectedBank?: Bank` - 선택된 은행
- `onPress: () => void` - 선택 핸들러
- `placeholder?: string` - 플레이스홀더 텍스트

### TransactionDetailsCard

거래 상세 정보를 표시하는 카드 컴포넌트

**Props:**
- `recipientName: string` - 받는 분 이름
- `bankName?: string` - 은행명
- `accountNumber?: string` - 계좌번호
- `amount: number` - 송금액
- `isBluetoothTransfer?: boolean` - 블루투스 송금 여부
- `userId?: string` - 사용자 ID

**Features:**
- 송금 방식별 다른 UI
- 금액 천단위 구분 표시
- 블루투스/일반 송금 구분 표시

### CompleteMessage

송금 완료 메시지 및 애니메이션 컴포넌트

**Props:**
- `amount: number` - 송금액
- `isBluetoothTransfer?: boolean` - 블루투스 송금 여부
- `recipientName?: string` - 받는 분 이름
- `accountNumber?: string` - 계좌번호
- `isLoading?: boolean` - 로딩 상태
- `isSuccess?: boolean` - 성공 여부
- `message?: string` - 메시지

**Features:**
- 로딩 중 GIF 애니메이션
- 성공/실패 상태별 메시지
- 송금 방식별 다른 메시지

## 타입 정의

### 송금 플로우 데이터

```typescript
interface TransferFlowData {
  // 출금 계좌 정보
  sourceAccountId?: string;
  
  // 계좌 정보 스텝
  accountNumber?: string;
  selectedBank?: Bank;
  userName?: string;
  uuid?: string;
  
  // 금액 스텝
  amount?: number;
  
  // 확인 스텝
  isConfirmed?: boolean;
  
  // 블루투스 송금 관련
  userId?: string;
  isBluetoothTransfer?: boolean;
  
  // 완료 스텝
  isCompleted?: boolean;
  transferResult?: any;
}
```

### 송금 요청 데이터

```typescript
interface TransferRequest {
  sendAccountId: number;
  sendBankCode: number;
  sendName: string;
  recvAccountNumber: string;
  recvBankCode: number;
  recvName: string;
  amount: number;
}

interface BluetoothTransferRequest {
  sendAccountId: number;
  sendBankCode: number;
  sendName: string;
  recvUuid: string;
  amount: number;
}
```

### 송금 응답 데이터

```typescript
interface TransferResponse {
  sendAccountId: number;
  recvAccountNumber?: string;
  recvName: string;
  amount: number;
}

interface TransferHistory {
  transferId: number;
  sendAccountId: number;
  recvAccountNumber: string;
  recvName: string;
  amount: number;
  transferDate: string;
  status: string;
}
```

## 에러 처리

### 주요 에러 타입
- `INSUFFICIENT_BALANCE`: 잔액 부족
- `INVALID_ACCOUNT`: 유효하지 않은 계좌
- `TRANSFER_LIMIT_EXCEEDED`: 송금 한도 초과
- `NETWORK_ERROR`: 네트워크 오류
- `SERVER_ERROR`: 서버 오류

### 에러 처리 전략
```typescript
const handleTransferError = (error: TransferError) => {
  switch (error.code) {
    case 'INSUFFICIENT_BALANCE':
      showDialog({
        title: '잔액 부족',
        content: '송금하려는 금액이 계좌 잔액을 초과합니다.',
        onConfirm: () => navigateToAccountScreen()
      });
      break;
    case 'INVALID_ACCOUNT':
      showDialog({
        title: '계좌 확인',
        content: '받는 계좌 정보를 다시 확인해주세요.',
        onConfirm: () => goBackToAccountStep()
      });
      break;
    default:
      showErrorToast(error.message);
  }
};
```

## 보안 고려사항

### 1. 송금 데이터 보안
- 민감한 금융 정보는 메모리에서 즉시 제거
- API 통신 시 HTTPS 강제
- 송금 금액 및 계좌 정보 암호화

### 2. 인증 및 권한
- 송금 시 PIN 재인증 필수
- JWT 토큰 기반 API 인증
- 송금 한도 서버 측 검증

### 3. 거래 무결성
- 송금 요청 중복 방지
- 트랜잭션 원자성 보장
- 실패 시 롤백 처리

## 성능 최적화

### 1. 컴포넌트 최적화
- React.memo로 불필요한 리렌더링 방지
- useCallback/useMemo 적절한 사용
- 단계별 컴포넌트 lazy loading

### 2. 상태 관리 최적화
- Zustand의 셀렉터 활용
- 전역 상태 최소화
- 로컬 상태와 전역 상태 적절한 분리

### 3. 애니메이션 최적화
- React Native Reanimated 활용
- GPU 가속 애니메이션 사용
- 60fps 애니메이션 유지

## 의존성

### 외부 라이브러리
- `zustand`: 상태 관리
- `react-native-reanimated`: 애니메이션
- `axios`: HTTP 클라이언트

### 내부 의존성
- `@/modules/account`: 계좌 정보 연동
- `@/modules/auth`: 사용자 인증
- `@/components`: 공통 UI 컴포넌트
- `@/utils`: 공통 유틸리티

---

**💸 송금 기능 관련 문의나 개선 사항이 있다면 프론트엔드팀에 연락해주세요!** 