# API 연동 사양서

## 1. 휴대폰 본인 인증

### 1-1. 인증코드 발송
- **URL**: `POST /api/users/phone`
- **Request Body**
  ```json
  {
    "phoneNumber": "01012345678"
  }
  ```
- **Response** (200)
  ```json
  {
    "isSuccess": true,
    "code": "1000",
    "message": "성공"
  }
  ```

### 1-2. 인증코드 확인
- **URL**: `POST /api/users/phone/verify`
- **Request Body**
  ```json
  {
    "phoneNumber": "01012345678",
    "verificationCode": "123456"
  }
  ```
- **Response**
  - **성공**
    ```json
    {
      "isSuccess": true,
      "code": "1000",
      "message": "성공"
    }
    ```
  - **실패**
    ```json
    {
      "isSuccess": false,
      "code": "2000",
      "message": "인증코드 검증 실패"
    }
    ```

---

## 2. 회원가입

- **URL**: `POST /api/users/signup`
- **Request Body**
  ```json
  {
    "username": "홍길동",
    "phoneNumber": "01012345678",
    "birthDate": "19900101",
    "pinCode": 123456
  }
  ```
- **Response** (201)
  ```json
  {
    "isSuccess": true,
    "code": "1000",
    "message": "회원가입 성공",
    "result": {
      "userId": 1
    }
  }
  ```
- **주요 에러 코드**

  | 상태 코드 | 의미                   |
  | --------- | ---------------------- |
  | 400       | 유효성 검증 실패       |
  | 409       | 이미 존재하는 사용자   |
  | 500       | 서버 오류              |

---

## 3. 인증·토큰 관리

### 3-1. 로그인
- **URL**: `POST /api/auth/login`
- **Request Body**
  ```json
  {
    "userId": 1,
    "pinCode": 123456
  }
  ```
- **Response** (200)
  ```json
  {
    "isSuccess": true,
    "code": 2001,
    "message": "로그인에 성공하였습니다.",
    "result": {
      "accessToken": "...",
      "refreshToken": "...",
      "accessTokenExpiresIn": 900
    }
  }
  ```
- **주요 에러**

  | 코드   | 상황                         | 추가 정보 예시                        |
  | ------ | ---------------------------- | ------------------------------------- |
  | 4000   | PIN 번호 오류                | `{ remainingAttempts: 3 }`            |
  | 4015   | 로그인 제한 (5회 오입력 시)  | `{ remainingSeconds, unlockTime }`    |
  | 4016   | 계정 잠금 (24시간)           | `{ remainingHours, unlockTime }`      |

---

### 3-2. 토큰 갱신
- **URL**: `POST /api/auth/refresh`
- **Request Body**
  ```json
  {
    "refreshToken": "…"
  }
  ```
- **Response** (200)
  ```json
  {
    "isSuccess": true,
    "code": 2003,
    "message": "토큰 갱신에 성공하였습니다.",
    "result": {
      "accessToken": "...",
      "refreshToken": "...",
      "accessTokenExpiresIn": 900
    }
  }
  ```
- **에러**
  - 401 Unauthorized (유효하지 않거나 만료된 refreshToken)

---

## 4. 로그아웃

- **URL**: `POST /api/auth/logout`
- **Headers**  
  ```
  Authorization: Bearer {accessToken}
  ```
- **Response** (200)
  ```json
  {
    "isSuccess": true,
    "code": 2002,
    "message": "로그아웃에 성공하였습니다."
  }
  ```
