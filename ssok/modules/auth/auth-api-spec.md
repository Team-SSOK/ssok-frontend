# API 연동 사양서

## 1. 휴대폰 본인 인증

### 1-1. 인증코드 발송

- **URL**: `POST /api/users/phone`
- **Request Body**
  ```json
  {
    "phoneNumber": "010-1234-5678"
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

### 1-2. 인증코드 확인 (사용자 존재 여부 확인)

- **URL**: `POST /api/users/phone/verify-with-user-check`
- **Description**: 사용자가 입력한 인증코드의 유효성을 검증하고 기존 사용자 여부를 확인합니다.
- **Request Body**
  ```json
  {
    "phoneNumber": "010-1234-5678",
    "verificationCode": "123456"
  }
  ```

#### Parameters
| 필드명 | 타입 | 필수 여부 | 설명 |
|--------|------|-----------|------|
| phoneNumber | String | Y | 인증받을 휴대폰 번호 |
| verificationCode | String | Y | 사용자가 입력한 인증코드 |

- **Response**
  - **성공 (신규 사용자)**
    ```json
    {
      "success": true,
      "code": 2000,
      "message": "요청에 성공하였습니다.",
      "data": {
        "isExistingUser": false,
        "userId": null
      }
    }
    ```
  - **성공 (기존 사용자)**
    ```json
    {
      "success": true,
      "code": 2000,
      "message": "요청에 성공하였습니다.",
      "data": {
        "isExistingUser": true,
        "userId": 123
      }
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

#### Status Codes
| 상태 코드 | 설명 |
|-----------|------|
| 200 | 인증코드 확인 성공 |
| 400 | 인증코드 불일치 또는 만료 |

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

  | 상태 코드 | 의미                 |
  | --------- | -------------------- |
  | 400       | 유효성 검증 실패     |
  | 409       | 이미 존재하는 사용자 |
  | 500       | 서버 오류            |

---

## 3. PIN 재등록 (기존 사용자)

- **URL**: `PATCH /api/users/re-pin/existing-user`
- **Description**: 휴대폰 인증 후 기존 사용자의 PIN 코드를 재등록합니다.
- **Headers**
  ```
  Content-Type: application/json
  ```
- **Request Body**
  ```json
  {
    "userId": 123,
    "pinCode": "654321"
  }
  ```
- **Response**
  - **성공**
    ```json
    {
      "success": true,
      "code": 2000,
      "message": "요청에 성공하였습니다."
    }
    ```
  - **실패 (인증 미완료)**
    ```json
    {
      "success": false,
      "code": 4003,
      "message": "휴대폰 인증이 필요합니다."
    }
    ```

---

## 4. 인증·토큰 관리

### 4-1. 로그인

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

  | 코드 | 상황                        | 추가 정보 예시                     |
  | ---- | --------------------------- | ---------------------------------- |
  | 4000 | PIN 번호 오류               | `{ remainingAttempts: 3 }`         |
  | 4015 | 로그인 제한 (5회 오입력 시) | `{ remainingSeconds, unlockTime }` |
  | 4016 | 계정 잠금 (24시간)          | `{ remainingHours, unlockTime }`   |

### 4-2. 토큰 갱신

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

## 5. 로그아웃

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

---

## 6. 앱 백그라운드 전환 API

- **URL**: `POST /api/auth/background`
- **Description**: 앱이 백그라운드로 전환될 때 호출하여 현재 Access Token을 블랙리스트에 추가합니다.
- **Headers**
  ```
  Authorization: Bearer {accessToken}
  ```
- **Response** (200)
  ```json
  {
    "isSuccess": true,
    "code": 2000,
    "message": "요청에 성공하였습니다."
  }
  ```
- **Error Responses**
  - 401 Unauthorized: 유효하지 않은 토큰

---

## 7. 앱 포그라운드 복귀 API

- **URL**: `POST /api/auth/foreground`
- **Description**: 앱이 포그라운드로 복귀할 때 호출하여 PIN 코드 재인증 후 새로운 토큰을 발급받습니다.
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
      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
      "accessTokenExpiresIn": 900
    }
  }
  ```
- **Error Responses**
  - 401 Unauthorized: 유효하지 않은 PIN 코드
  - 401 Unauthorized: 로그인 시도 횟수 초과
  - 401 Unauthorized: 계정 잠금
  - 404 Not Found: 사용자를 찾을 수 없음

---

## 8. 프로필 이미지 업로드

- **URL**: `POST /api/profiles`
- **Description**: 사용자의 프로필 이미지를 AWS S3에 업로드합니다.
- **Headers**
  | 헤더명 | 설명 |
  | -------------- | -------------------- |
  | Content-Type | multipart/form-data |
  | Authorization | Bearer {accessToken} |
  | X-User-Id | 유저 ID |
- **Request** (multipart/form-data)
  - `file`: 이미지 파일 (image/jpeg, image/png, image/gif)
- **File Constraints**
  - **크기 제한**: 최대 5MB
  - **형식**: image/jpeg, image/png, image/gif
  - **파일명**: `userId_uuid.extension` 형식으로 자동 생성
  - **기존 이미지**: 업로드 시 기존 이미지는 자동 삭제 후 교체
- **Success Response** (200 OK)
  ```json
  {
    "isSuccess": true,
    "code": 2000,
    "message": "요청에 성공하였습니다.",
    "result": {
      "id": 1,
      "url": "https://ssok-project-bucket.s3.ap-northeast-2.amazonaws.com/profile-images/123_e7b8f3a2-9df4-456e.png",
      "contentType": "image/png"
    }
  }
  ```
- **Error Responses**
  - 4020: 파일이 비어있는 경우
    ```json
    {
      "isSuccess": false,
      "code": 4020,
      "message": "파일이 비어있습니다.",
      "result": null
    }
    ```
  - 4021: 지원하지 않는 파일 형식
    ```json
    {
      "isSuccess": false,
      "code": 4021,
      "message": "지원하지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.",
      "result": null
    }
    ```
  - 4022: 파일 크기 초과
    ```json
    {
      "isSuccess": false,
      "code": 4022,
      "message": "파일 크기가 5MB를 초과합니다.",
      "result": null
    }
    ```

---

## 9. 프로필 이미지 삭제

- **URL**: `DELETE /api/profiles`
- **Description**: 사용자의 프로필 이미지를 S3와 DB에서 완전히 삭제합니다.
- **Headers**
  | 헤더명 | 설명 |
  | -------------- | -------------------- |
  | Content-Type | application/json |
  | Authorization | Bearer {accessToken} |
  | X-User-Id | 유저 ID |
- **Success Response** (200 OK)
  ```json
  {
    "isSuccess": true,
    "code": 2000,
    "message": "요청에 성공하였습니다.",
    "result": null
  }
  ```
- **Error Responses**
  - 5020: 삭제할 프로필 이미지 없음
    ```json
    {
      "isSuccess": false,
      "code": 5020,
      "message": "프로필 이미지를 찾을 수 없습니다.",
      "result": null
    }
    ```
  - 5022: S3 삭제 실패
    ```json
    {
      "isSuccess": false,
      "code": 5022,
      "message": "파일 삭제 중 오류가 발생했습니다.",
      "result": null
    }
    ```