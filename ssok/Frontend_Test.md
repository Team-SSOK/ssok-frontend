# 프론트엔드 테스트 명세서

## 개요
본 문서는 SSOK 앱의 프론트엔드 컴포넌트 및 기능에 대한 Jest 테스트 명세서입니다.
React Native Testing Library(@testing-library/react-native)와 Jest를 사용하여 사용자 인터페이스, 사용자 상호작용, 컴포넌트 렌더링 등을 테스트합니다.

## 테스트 환경 설정
- **테스트 프레임워크**: Jest (jest-expo preset)
- **테스트 라이브러리**: @testing-library/react-native
- **모킹**: React Native 네이티브 모듈 모킹 (BLE, 권한, 알림 등)

## 프론트엔드 테스트 명세

### 🔐 회원 관리 (Authentication)

#### 1.1 회원가입 (Registration)
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-001 | WelcomeScreen | 화면 진입 렌더링 | 인트로 화면의 핵심 메시지와 'SSOK 시작하기' 버튼이 올바르게 렌더링되는지 테스트 |
| FT-SSOK-002 | RegisterForm | 정보 입력 폼 검증 | 이름, 생년월일, 휴대폰 번호 입력 필드의 유효성 검증 로직 테스트 |
| FT-SSOK-003 | RegisterForm | 약관 동의 체크박스 | 필수 약관 동의 체크박스 상태 변경 및 검증 테스트 |
| FT-SSOK-004 | PinSetupScreen | PIN 번호 설정 | 6자리 PIN 입력 UI의 시각적 피드백 및 입력 제한 테스트 |
| FT-SSOK-005 | PinSetupScreen | PIN 재입력 검증 | PIN 재입력 시 일치 여부 검증 및 오류 메시지 표시 테스트 |
| FT-SSOK-006 | RegistrationComplete | 가입 완료 화면 | 회원가입 완료 메시지 및 자동 로그인 처리 플로우 테스트 |

#### 1.2 로그인 (Login)
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-007 | AppStateManager | 앱 실행 토큰 확인 | AsyncStorage에서 토큰 존재 여부 확인 및 리디렉션 로직 테스트 |
| FT-SSOK-008 | PinLoginScreen | PIN 로그인 키패드 | 키패드 형태의 PIN 입력 UI 렌더링 및 입력 처리 테스트 |
| FT-SSOK-009 | PinLoginScreen | PIN 입력 시각 피드백 | PIN 입력 시 마스킹 처리 및 시각적 피드백 테스트 |
| FT-SSOK-010 | AuthService | 인증 및 홈 진입 | PIN 인증 성공 시 토큰 저장 및 홈 화면 네비게이션 테스트 |

### 🏠 홈 화면 (Home)

#### 2.1 메인 페이지
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-011 | HomeScreen | 주계좌 정보 표시 | 연결된 주계좌의 계좌명과 잔액이 올바르게 표시되는지 테스트 |
| FT-SSOK-012 | RecentTransferList | 최근 송금 내역 표시 | 최신 송금 내역 리스트 렌더링 및 데이터 포맷팅 테스트 |
| FT-SSOK-013 | TransferButton | 송금 버튼 클릭 | 계좌별 송금 버튼 클릭 시 송금 페이지 네비게이션 테스트 |
| FT-SSOK-014 | HomeScreen | 로딩 상태 처리 | 데이터 로딩 중 로딩 인디케이터 표시 테스트 |
| FT-SSOK-015 | HomeScreen | 오류 상태 처리 | API 오류 시 오류 메시지 표시 및 재시도 기능 테스트 |

#### 2.2 계좌 상세
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-016 | AccountDetailScreen | 계좌 상세 진입 | 홈에서 계좌 클릭 시 상세 화면 네비게이션 테스트 |
| FT-SSOK-017 | TransactionHistory | 거래내역 표시 | 계좌별 거래내역 리스트 렌더링 및 정렬 테스트 |
| FT-SSOK-018 | FilterButtons | 기간 필터링 | 1주일/1개월/3개월 필터 버튼 기능 테스트 |

### 💸 송금 (Transfer)

#### 3.1 수신자 정보 입력
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-019 | AccountInputScreen | 계좌번호 입력 | 키패드 형식의 계좌번호 입력 UI 및 포맷팅 테스트 |
| FT-SSOK-020 | BankSelector | 은행 선택 Grid | 은행 목록 Grid UI 렌더링 및 선택 상태 관리 테스트 |
| FT-SSOK-021 | AccountInputScreen | 다음 버튼 활성화 | 계좌번호와 은행 선택 완료 시 버튼 활성화 로직 테스트 |
| FT-SSOK-022 | AccountInputScreen | 계좌번호 유효성 검증 | 계좌번호 형식 검증 및 오류 메시지 표시 테스트 |

#### 3.2 금액 입력
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-023 | AmountInputScreen | 금액 입력 키패드 | 전용 키패드 UI 렌더링 및 천 단위 구분 기호 적용 테스트 |
| FT-SSOK-024 | AmountInputScreen | 잔액 초과 검증 | 입력 금액이 보유 잔액 초과 시 오류 메시지 및 버튼 비활성화 테스트 |
| FT-SSOK-025 | RecipientInfo | 수신자 정보 확인 | 상단 영역에 수신자 실명과 은행명 표시 테스트 |
| FT-SSOK-026 | AmountInputScreen | 금액 포맷팅 | 입력된 금액의 화폐 단위 포맷팅 및 표시 테스트 |

#### 3.3 송금 확인 및 완료
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-027 | TransferConfirmScreen | 송금 정보 확인 | 입력된 송금 정보(금액, 수신자) 최종 확인 화면 테스트 |
| FT-SSOK-028 | TransferConfirmScreen | 송금 요청 처리 | '송금하기' 버튼 클릭 시 API 호출 및 로딩 상태 처리 테스트 |
| FT-SSOK-029 | TransferCompleteScreen | 송금 완료 화면 | 송금 성공 시 완료 메시지 및 요약 정보 표시 테스트 |
| FT-SSOK-030 | TransferCompleteScreen | 송금 실패 처리 | 송금 실패 시 오류 메시지 및 재시도 옵션 테스트 |

### 📡 블루투스 송금 (Bluetooth Transfer)

#### 4.1 권한 및 상태 확인
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-031 | BluetoothPermission | 블루투스 권한 요청 | 블루투스 권한 요청 다이얼로그 및 응답 처리 테스트 |
| FT-SSOK-032 | BluetoothStatusCheck | 블루투스 상태 확인 | 블루투스 비활성화 시 활성화 유도 메시지 표시 테스트 |
| FT-SSOK-033 | BluetoothService | 권한 거부 처리 | 블루투스 권한 거부 시 안내 메시지 및 설정 이동 옵션 테스트 |

#### 4.2 사용자 탐색 및 송금
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-034 | BluetoothScanScreen | 디바이스 검색 UI | BLE 스캔 중 로딩 인디케이터 및 스캔 상태 표시 테스트 |
| FT-SSOK-035 | BluetoothDeviceList | 디바이스 목록 표시 | 탐색된 BLE 기기 리스트 렌더링 및 사용자 정보 표시 테스트 |
| FT-SSOK-036 | BluetoothTransferScreen | 블루투스 송금 금액 입력 | 선택된 수신자에 대한 금액 입력 UI 테스트 |
| FT-SSOK-037 | BluetoothTransferScreen | 블루투스 송금 요청 | 블루투스 송금 요청 전송 및 응답 처리 테스트 |

### 📑 거래 내역 (Transaction History)

| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-038 | TransactionHistoryScreen | 페이지 진입 | 하단 탭바에서 거래내역 탭 클릭 시 화면 진입 테스트 |
| FT-SSOK-039 | TransactionHistoryScreen | 데이터 로딩 | 초기 화면 진입 시 거래내역 API 호출 및 데이터 렌더링 테스트 |
| FT-SSOK-040 | InfiniteScrollList | 무한 스크롤 | 리스트 하단 도달 시 추가 데이터 로딩 및 리스트 업데이트 테스트 |
| FT-SSOK-041 | TransactionItem | 거래 내역 아이템 | 개별 거래 내역 아이템의 정보 표시 및 포맷팅 테스트 |

### ⚙️ 계정 설정 (Account Settings)

#### 6.1 프로필 관리
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-042 | ProfileScreen | 프로필 이미지 표시 | 기본 또는 사용자 프로필 이미지 원형 썸네일 표시 테스트 |
| FT-SSOK-043 | ProfileImagePicker | 이미지 수정/삭제 | 이미지 클릭 시 액션 시트 표시 및 갤러리 선택 기능 테스트 |
| FT-SSOK-044 | ProfileScreen | 사용자 정보 표시 | 사용자 이름, 휴대폰 번호 등 읽기 전용 정보 표시 테스트 |

#### 6.2 PIN 변경
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-045 | PinChangeScreen | 기존 PIN 확인 | 기존 PIN 입력 및 서버 검증 처리 테스트 |
| FT-SSOK-046 | PinChangeScreen | 새로운 PIN 설정 | 새 PIN 입력 및 재입력 일치 검증 테스트 |
| FT-SSOK-047 | PinChangeScreen | PIN 변경 완료 | PIN 변경 성공 시 완료 메시지 및 로그인 화면 이동 테스트 |

#### 6.3 약관 보기
| 테스트 ID | 컴포넌트/화면 | 테스트 항목 | 설명 |
|-----------|---------------|-------------|------|
| FT-SSOK-048 | TermsScreen | 약관 목록 표시 | 이용약관, 개인정보 처리방침 등 약관 리스트 렌더링 테스트 |
| FT-SSOK-049 | TermsDetailScreen | 약관 상세 내용 | 약관 클릭 시 상세 페이지 진입 및 내용 표시 테스트 |

## 공통 컴포넌트 테스트

### UI 컴포넌트
| 테스트 ID | 컴포넌트 | 테스트 항목 | 설명 |
|-----------|-----------|-------------|------|
| FT-SSOK-050 | CommonButton | 버튼 렌더링 | 다양한 props에 따른 버튼 스타일 및 상태 렌더링 테스트 |
| FT-SSOK-051 | CommonButton | 버튼 인터랙션 | 클릭 이벤트 처리 및 disabled 상태 테스트 |
| FT-SSOK-052 | TextInput | 입력 필드 검증 | 다양한 유효성 검증 규칙 적용 및 오류 메시지 표시 테스트 |
| FT-SSOK-053 | CommonHeader | 헤더 네비게이션 | 뒤로가기 버튼 및 타이틀 표시 테스트 |
| FT-SSOK-054 | LoadingIndicator | 로딩 상태 | 로딩 인디케이터 표시 및 애니메이션 테스트 |

### 상태 관리 및 유틸리티
| 테스트 ID | 컴포넌트/서비스 | 테스트 항목 | 설명 |
|-----------|-----------------|-------------|------|
| FT-SSOK-055 | UserStore | 사용자 상태 관리 | Zustand를 사용한 사용자 상태 업데이트 및 persistence 테스트 |
| FT-SSOK-056 | AccountStore | 계좌 상태 관리 | 계좌 정보 상태 관리 및 업데이트 로직 테스트 |
| FT-SSOK-057 | ToastConfig | 토스트 메시지 | 다양한 타입의 토스트 메시지 표시 및 자동 숨김 테스트 |
| FT-SSOK-058 | DialogProvider | 다이얼로그 표시 | 확인/취소 다이얼로그 표시 및 사용자 응답 처리 테스트 |

## 통합 테스트

| 테스트 ID | 테스트 시나리오 | 설명 |
|-----------|----------------|------|
| FT-SSOK-059 | 회원가입 플로우 | 회원가입 전체 플로우 통합 테스트 (정보입력 → PIN설정 → 완료) |
| FT-SSOK-060 | 송금 플로우 | 일반 송금 전체 플로우 통합 테스트 (수신자입력 → 금액입력 → 확인 → 완료) |
| FT-SSOK-061 | 블루투스 송금 플로우 | 블루투스 송금 전체 플로우 통합 테스트 (권한 → 검색 → 선택 → 송금) |
| FT-SSOK-062 | 네비게이션 플로우 | 앱 내 주요 화면 간 네비게이션 테스트 |

## 테스트 실행 가이드

### 테스트 명령어
```bash
# 모든 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- --testPathPattern=<파일명>

# 특정 테스트 케이스 실행
npm test -- --testNamePattern=<테스트명>

# 커버리지 확인
npm test -- --coverage
```

### 모킹(Mocking) 가이드
```javascript
// React Native 네이티브 모듈 모킹 예시
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
  })),
}));

// AsyncStorage 모킹
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

### 테스트 작성 예시
```javascript
// 컴포넌트 렌더링 테스트
import { render, fireEvent } from '@testing-library/react-native';
import CommonButton from '../components/CommonButton';

describe('CommonButton', () => {
  test('FT-SSOK-050: 버튼이 올바르게 렌더링된다', () => {
    const { getByText } = render(
      <CommonButton title="테스트 버튼" onPress={() => {}} />
    );
    
    expect(getByText('테스트 버튼')).toBeTruthy();
  });

  test('FT-SSOK-051: 버튼 클릭 이벤트가 처리된다', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CommonButton title="클릭 버튼" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('클릭 버튼'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

## 테스트 커버리지 목표
- **전체 커버리지**: 85% 이상
- **컴포넌트 테스트**: 90% 이상
- **유틸리티 함수**: 95% 이상
- **상태 관리**: 90% 이상

## 주의사항
1. 네이티브 모듈(BLE, 권한, 알림 등)은 반드시 모킹하여 테스트
2. 비동기 작업은 `waitFor`, `findBy*` 등을 사용하여 적절히 처리
3. 스냅샷 테스트는 UI 변경이 빈번한 초기 개발 단계에서는 선택적으로 사용
4. 테스트 데이터는 실제 API 응답 형태와 일치하도록 작성
5. 에러 상황에 대한 테스트 케이스도 반드시 포함 