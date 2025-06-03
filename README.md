# SSOK - 스마트 금융 플랫폼 📱💳
> **혁신적인 블루투스 카드 리더 기반 모바일 금융 서비스**

SSOK은 React Native와 TypeScript로 구축된 차세대 모바일 금융 플랫폼입니다. 블루투스 카드 리더기와의 연동을 통해 안전하고 편리한 결제 경험을 제공합니다.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![Framework](https://img.shields.io/badge/framework-React%20Native-61dafb.svg)
![Language](https://img.shields.io/badge/language-TypeScript-3178c6.svg)

## 🚀 주요 기능

### 💰 금융 서비스
- **송금 & 결제**: 실시간 계좌 이체 및 QR 코드 결제
- **계좌 관리**: 다중 계좌 연동 및 잔액 조회
- **거래 내역**: 상세한 거래 기록 및 통계 분석
- **결제 한도**: 일일/월간 거래 한도 설정 및 관리

### 🔒 보안 & 인증
- **다중 인증**: PIN, 생체 인증 (지문/Face ID), SMS 인증
- **토큰 관리**: JWT 기반 자동 토큰 갱신
- **데이터 암호화**: AES-256 암호화로 민감 정보 보호
- **부정거래 방지**: 실시간 사기 탐지 시스템

### 📶 블루투스 연동
- **카드 리더기**: 블루투스 카드 리더기 자동 연결
- **카드 읽기/쓰기**: NFC/RFID 카드 정보 처리
- **디바이스 관리**: 페어링된 디바이스 목록 관리
- **자동 재연결**: 연결 끊김 시 자동 복구

### 🎨 사용자 경험
- **직관적 UI**: Material Design 기반 모던 인터페이스
- **부드러운 애니메이션**: React Native Reanimated 활용
- **접근성**: 스크린 리더 및 키보드 네비게이션 지원
- **다크모드**: 시스템 테마 연동

## 🛠️ 기술 스택

### Frontend
- **React Native**: 크로스 플랫폼 네이티브 앱 개발
- **TypeScript**: 타입 안전성 및 개발 효율성
- **Expo Router**: File-based routing 시스템
- **React Native Reanimated**: 고성능 애니메이션

### 상태 관리 & 데이터
- **Zustand**: 가벼운 상태 관리 라이브러리
- **React Hook Form**: 효율적인 폼 처리
- **Expo SecureStore**: 안전한 로컬 데이터 저장

### 네이티브 기능
- **Expo Notifications**: 푸시 알림 시스템
- **Expo Local Authentication**: 생체 인증
- **React Native Bluetooth Serial**: 블루투스 통신
- **React Native Camera**: QR 코드 스캔

### 개발 도구
- **ESLint & Prettier**: 코드 품질 관리
- **TypeScript**: 정적 타입 검사
- **Metro**: React Native 번들러
- **EAS Build**: 클라우드 빌드 시스템

## 📁 프로젝트 구조

```
ssok/
├── 📱 app/                  # Expo Router 기반 화면
│   ├── (auth)/             # 인증 플로우
│   ├── (app)/              # 메인 앱
│   │   ├── (tabs)/         # 탭 네비게이션
│   │   ├── transfer/       # 송금 화면
│   │   └── account/        # 계좌 화면
├── 🧩 modules/             # 기능별 모듈
│   ├── auth/               # 인증 시스템
│   ├── bluetooth/          # 블루투스 연동
│   ├── transfer/           # 송금/결제
│   ├── account/            # 계좌 관리
│   ├── settings/           # 사용자 설정
│   └── notification/       # 알림 시스템
├── 🎨 components/          # 공용 UI 컴포넌트
├── 🏪 stores/              # 전역 상태 관리
├── 🔧 utils/               # 유틸리티 함수
├── 🎯 hooks/               # 커스텀 훅
├── 🌈 theme/               # 테마 및 스타일
├── 🔌 services/            # 외부 서비스 연동
└── 📡 api/                 # API 클라이언트
```

## 🎯 아키텍처 특징

### 🏗️ 모듈형 구조
- **독립성**: 각 모듈은 독립적으로 개발 및 테스트 가능
- **재사용성**: 컴포넌트, 훅, 유틸리티 재사용 극대화
- **확장성**: 새로운 기능 모듈 쉽게 추가 가능

### 📋 코딩 규칙
- **TypeScript First**: 모든 코드에 타입 정의
- **Functional Components**: 함수형 컴포넌트 및 훅 활용
- **Clean Code**: ESLint, Prettier로 코드 품질 유지
- **Documentation**: 모든 모듈에 README 및 API 문서 제공

### 🔄 상태 관리 패턴
- **Zustand**: 간단하고 직관적인 전역 상태
- **Local State**: 컴포넌트별 로컬 상태 최소화
- **Derived State**: 필요 시 계산된 상태 활용

## 컨벤션
#### 공통 개발 컨벤션 및 브랜치 정책은 [여기](https://github.com/money-moni/.github/blob/main/docs/README.md) 를 참고해주세요.
#### 프론트엔드 코드 컨벤션 밎 정책은 [여기](https://github.com/money-moni/.github/blob/main/docs/FRONTEND.md) 를 참고해주세요.

## 🚦 시작하기

### 필수 요구사항
- Node.js 18+ 
- pnpm 8+
- Expo CLI
- React Native development environment

### 설치 및 실행
```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm start

# iOS 시뮬레이터 실행
pnpm ios

# Android 에뮬레이터 실행
pnpm android
```

### 환경 설정
```bash
# 환경 변수 설정
cp .env.example .env.local

# EAS 설정 (빌드용)
eas login
eas build:configure
```

## 📖 문서 가이드

### 📚 개발 문서
- **[Modules README](./modules/README.md)**: 모듈 구조 및 개발 가이드
- **[App README](./app/README.md)**: 화면 구조 및 네비게이션
- **[API Documentation](./docs/)**: API 명세 및 사용법

### 🔧 모듈별 문서
- **[Auth Module](./modules/auth/README.md)**: 인증 시스템
- **[Bluetooth Module](./modules/bluetooth/README.md)**: 블루투스 연동
- **[Transfer Module](./modules/transfer/README.md)**: 송금/결제
- **[Account Module](./modules/account/README.md)**: 계좌 관리
- **[Settings Module](./modules/settings/README.md)**: 사용자 설정

## 🧪 테스트

### 테스트 실행
```bash
# 단위 테스트
pnpm test

# E2E 테스트
pnpm test:e2e

# 커버리지 확인
pnpm test:coverage
```

### 테스트 전략
- **Unit Tests**: 개별 함수 및 컴포넌트 테스트
- **Integration Tests**: 모듈 간 상호작용 테스트  
- **E2E Tests**: 사용자 시나리오 기반 전체 플로우 테스트

## 🚀 배포

### 빌드 및 배포
```bash
# 개발용 빌드
eas build --profile development

# 프로덕션 빌드
eas build --profile production

# 앱스토어 배포
eas submit --platform ios

# 플레이스토어 배포
eas submit --platform android
```

## 🔒 보안 고려사항

### 데이터 보안
- **암호화**: 민감한 데이터 AES-256 암호화
- **토큰 관리**: JWT 자동 갱신 및 만료 처리
- **로컬 저장**: Expo SecureStore 활용

### 네트워크 보안
- **HTTPS**: 모든 API 통신 HTTPS 강제
- **Certificate Pinning**: SSL 인증서 고정
- **Rate Limiting**: API 호출 빈도 제한

### 앱 보안
- **코드 난독화**: 프로덕션 빌드 시 코드 보호
- **루팅 탐지**: 루팅/탈옥 디바이스 차단
- **디버깅 방지**: 릴리즈 모드에서 디버깅 비활성화

### 코드 품질
- ESLint 규칙 준수
- TypeScript 타입 오류 해결

### 이슈 및 버그 리포트
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Slack**: 실시간 개발 논의
- **Jira**: 프로젝트 관리 및 태스크 추적

---

<div align="center">

**🌟 SSOK과 함께 금융의 미래를 만들어가세요! 🌟**

Made with ❤️ by SSOK Team

</div> 
