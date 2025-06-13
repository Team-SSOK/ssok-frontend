 # SSOK 앱 End-to-End (E2E) 테스트 구축 가이드 (with Maestro)

### 1. E2E 테스트란?

E2E 테스트는 사용자의 실제 시나리오를 처음부터 끝까지 흉내 내어 전체 시스템(프론트엔드, 백엔드 API, 데이터베이스 등)이 올바르게 동작하는지 확인하는 자동화 테스트입니다.

SSOK 앱의 경우, 다음과 같은 대표적인 사용자 흐름을 테스트할 수 있습니다.
-   **로그인 플로우**: 앱 실행 → 휴대폰 번호 입력 → 인증 → PIN 입력 → 메인 화면 진입
-   **계좌 등록 플로우**: 메인 화면 진입 → 계좌 등록 선택 → 계좌 선택 → 등록 완료 → 메인 화면에 반영 확인
-   **송금 플로우**: 메인 화면에서 계좌 선택 → 송금 버튼 → 금액 및 수신자 입력 → PIN 인증 → 송금 완료 및 잔액 변경 확인

E2E 테스트를 통해 새로운 기능 추가나 코드 리팩터링 시 기존 기능이 망가지는 것을 사전에 방지하여 앱의 안정성을 크게 높일 수 있습니다.

### 2. 테스트 도구 선정: Maestro

다양한 E2E 테스트 도구(Detox, Appium 등)가 있지만, SSOK 앱에는 다음과 같은 이유로 **Maestro**를 추천합니다.

-   **압도적인 편의성**: 복잡한 설치 과정이나 네이티브 코드 빌드 없이 CLI 설치만으로 바로 테스트를 시작할 수 있습니다. (특히 Windows 환경에서 Detox보다 설정이 훨씬 간편합니다.)
-   **직관적인 YAML 문법**: 코딩 지식이 깊지 않아도 `tapOn: '로그인'`처럼 사람이 읽기 쉬운 형식으로 테스트 코드를 작성할 수 있습니다.
-   **높은 안정성**: UI 요소의 변화에 강하고, 테스트 실행 속도가 매우 빠릅니다. Flaky(일관성 없는) 테스트가 적어 신뢰도가 높습니다.

### 3. Maestro 설치 및 환경 설정

#### 3.1. 사전 준비
-   **Android Emulator 또는 실제 기기**: Android Studio를 통해 에뮬레이터를 실행하거나, USB 디버깅이 활성화된 실제 기기를 PC에 연결합니다.
-   **SSOK 앱 빌드**: 테스트할 개발용 앱(.apk)이 준비되어 있어야 합니다. `expo run:android`를 통해 생성된 빌드를 사용합니다.

#### 3.2. Maestro CLI 설치
사용자님의 OS가 Windows이므로 PowerShell에서 아래 명령어를 실행합니다.

```powershell
iwr -useb https://get.maestro.mobile.dev | iex
```
*(macOS/Linux의 경우: `curl -Ls "https://get.maestro.mobile.dev" | bash`)*

설치가 완료되면 `maestro --version` 명령어로 성공 여부를 확인합니다.

#### 3.3. 프로젝트 구조
프로젝트 루트(`C:\projects\ssok-frontend\ssok`)에 테스트 파일을 관리할 `.maestro` 폴더를 생성합니다.

```
ssok/
├── .maestro/
│   ├── flow-01-signin.yml
│   ├── flow-02-register-account.yml
│   └── config.yml
├── app/
├── components/
...
```

### 4. 첫 번째 테스트 Flow 작성하기 (로그인 시나리오)

가장 기본이 되는 '로그인' 플로우를 테스트하는 파일을 작성해 보겠습니다.

**.maestro/flow-01-signin.yml**
```yaml
# 앱의 패키지 ID를 지정합니다. (android/app/build.gradle의 applicationId 참고)
appId: "com.jaehongpark.ssok"
---
# 앱을 실행하고 초기 상태를 기다립니다.
- launchApp

# --- 휴대폰 번호 입력 및 인증 ---
- tapOn:
    text: "휴대폰 번호" # 'CustomTextInput'의 placeholder 텍스트
- inputText: "010-1234-5678"
- tapOn: "인증번호 받기"
- waitForAnimationToEnd # 애니메이션이나 로딩을 기다립니다.

# --- 인증번호 입력 ---
- tapOn:
    text: "인증번호 6자리"
- inputText: "123456"
- tapOn: "인증하기"
- waitForAnimationToEnd

# --- PIN 번호 입력 ---
# PIN 입력 화면으로 전환될 때까지 최대 10초 대기
- waitForTaps: 10000
- tapOn: "1"
- tapOn: "2"
- tapOn: "3"
- tapOn: "4"
- tapOn: "5"
- tapOn: "6"

# --- 메인 화면 검증 ---
# 홈 화면의 특정 요소가 보이는지 확인하여 로그인 성공을 검증합니다.
- assertVisible: "SSOK" # Header 타이틀 등
- assertVisible: ".*원" # 계좌 잔액이 표시되는 패턴
```

### 5. 테스트 실행하기

1.  PC에 에뮬레이터가 실행 중이거나 실제 기기가 연결되었는지 확인합니다.
2.  터미널에서 프로젝트 루트(`ssok/`)로 이동합니다.
3.  아래 명령어를 실행하여 작성한 테스트를 시작합니다.

    ```bash
    maestro test .maestro/flow-01-signin.yml
    ```

Maestro가 자동으로 기기에서 앱을 조작하며 각 단계를 수행하는 것을 실시간으로 볼 수 있습니다. 모든 테스트가 성공적으로 끝나면 터미널에 성공 메시지가 출력됩니다.

### 6. 심화 테스트 시나리오 및 모범 사례

#### 6.1. 테스트 신뢰도 향상을 위한 `testID` 사용

텍스트 기반의 선택자(`tapOn: '로그인'`)는 문구가 바뀌면 테스트가 실패하는 단점이 있습니다. 이를 해결하기 위해 `testID`를 사용하는 것이 가장 좋습니다.

**컴포넌트 수정:**
```tsx
// 예시: ssok/components/Button.tsx
<TouchableOpacity testID={`button-${title}`} onPress={onPress}>
  <Text>{title}</Text>
</TouchableOpacity>

// 예시: ssok/components/CustomTextInput.tsx
<TextInput
  testID={`input-${label}`}
  value={value}
  /* ... other props ... */
/>
```

**Maestro Flow 수정:**
```yaml
# ...
- tapOn:
    id: "input-휴대폰 번호" # testID로 요소를 선택
- inputText: "010-1234-5678"
- tapOn:
    id: "button-인증번호 받기"
# ...
```

#### 6.2. 재사용 가능한 플로우 `subFlow`

로그인처럼 여러 테스트에서 반복되는 구간은 별도의 파일로 분리하여 재사용할 수 있습니다.

**.maestro/common/login.yml**
```yaml
appId: "com.jaehongpark.ssok"
---
- launchApp
- tapOn:
    id: "input-휴대폰 번호"
- inputText: "010-1234-5678"
# ... (로그인 완료까지의 과정)
- assertVisible: "홈"
```

**계좌 등록 테스트에서 사용:**
**.maestro/flow-02-register-account.yml**
```yaml
appId: "com.jaehongpark.ssok"
---
# 로그인 subFlow 실행
- runFlow: ./common/login.yml

# --- 계좌 등록 로직 시작 ---
- tapOn: "계좌 추가하기"
# ...
```

#### 6.3. CI/CD 파이프라인 연동

E2E 테스트는 GitHub Actions 같은 CI/CD 도구와 연동할 때 가장 큰 효과를 발휘합니다. 새로운 코드가 Push 될 때마다 자동으로 E2E 테스트를 실행하여 버그를 조기에 발견할 수 있습니다.

-   **Maestro Cloud**: Maestro에서 제공하는 클라우드 환경을 사용하면 여러 기기에서 병렬로 테스트를 실행하고 결과를 리포트로 받아볼 수 있어 더욱 효율적입니다.

### 7. 결론

Maestro를 활용하면 SSOK 앱의 핵심 기능들을 안정적으로 자동 테스트할 수 있는 강력한 E2E 테스트 환경을 구축할 수 있습니다. 처음에는 로그인, 회원가입 등 가장 중요한 플로우부터 시작하여 점차 테스트 범위를 넓혀나가는 것이 좋습니다. 이 가이드가 SSOK 앱의 품질을 한 단계 끌어올리는 데 훌륭한 출발점이 되기를 바랍니다.