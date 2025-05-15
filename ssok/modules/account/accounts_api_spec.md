# Accounts API

## 1. 연동 계좌 조회

- **URL**: `POST /api/accounts/openbank`
- **Headers**

  | 헤더명        | 설명               |
  | ------------- | ------------------ |
  | Content-Type  | `application/json` |
  | Authorization | `Bearer <token>`   |
  | X-User-Id     | 사용자 ID          |

- **Request Body**: 없음  
  (백엔드에서 `X-User-Id`로 Open Banking API 호출)

- **Response (200)**
  ```json
  {
    "isSuccess": true,
    "code": 200,
    "message": "연동 계좌 조회를 완료했습니다.",
    "result": [
      {
        "bankCode": 2,
        "bankName": "카카오뱅크",
        "accountNumber": "1111-11111",
        "accountTypeCode": "예금"
      },
      {
        "bankCode": 3,
        "bankName": "KB국민은행",
        "accountNumber": "2222-11111",
        "accountTypeCode": "적금"
      }
    ]
  }
  ```

---

## 2. 연동 계좌 등록

- **URL**: `POST /api/accounts`
- **Headers**

  | 헤더명        | 설명               |
  | ------------- | ------------------ |
  | Content-Type  | `application/json` |
  | Authorization | `Bearer <token>`   |
  | X-User-Id     | 사용자 ID          |

- **Request Body**

  ```json
  {
    "accountNumber": "111111-1111",
    "bankCode": 1,
    "accountTypeCode": 1
  }
  ```

  | 필드            | 타입   | 필수 여부 | 설명          |
  | --------------- | ------ | --------- | ------------- |
  | accountNumber   | String | Y         | 계좌번호      |
  | bankCode        | Long   | Y         | 은행 코드     |
  | accountTypeCode | Long   | Y         | 계좌 타입코드 |

- **Response (201)**
  ```json
  {
    "isSuccess": true,
    "code": 201,
    "message": "연동 계좌 등록을 완료했습니다.",
    "result": {
      "accountId": 2,
      "accountNumber": "111111-1111",
      "bankCode": 1,
      "bankName": "SSOK뱅크",
      "accountAlias": null,
      "isPrimaryAccount": false,
      "accountTypeCode": "예금"
    }
  }
  ```

---

## 3. 연동 계좌 및 잔액 조회

- **URL**: `GET /api/accounts`
- **Headers**

  | 헤더명        | 설명               |
  | ------------- | ------------------ |
  | Content-Type  | `application/json` |
  | Authorization | `Bearer <token>`   |
  | X-User-Id     | 사용자 ID          |

- **Request Body**: 없음  
  (백엔드에서 `X-User-Id`로 계좌 테이블 조회 및 잔액 포함)

- **Response (200)**
  ```json
  {
    "isSuccess": true,
    "code": 200,
    "message": "연동 계좌 및 잔액 조회를 완료했습니다.",
    "result": [
      {
        "accountId": 2,
        "accountNumber": "111111-1111",
        "bankCode": 2,
        "bankName": "카카오뱅크",
        "accountAlias": "모임계좌",
        "isPrimaryAccount": true,
        "accountTypeCode": "예금",
        "balance": 10000
      },
      {
        "accountId": 3,
        "accountNumber": "111111-1111",
        "bankCode": 3,
        "bankName": "KB국민은행",
        "accountAlias": "용돈모으기",
        "isPrimaryAccount": false,
        "accountTypeCode": "적금",
        "balance": 1000000
      }
    ]
  }
  ```

---

## 4. 연동 계좌 상세 조회

### 개요

사용자가 특정 계좌의 상세 정보(잔액 포함)를 조회합니다.

### 요청

#### API URL

```
GET {PORT}/api/accounts/{id}
```

#### Path Variable

| 변수명 | 설명        |
| ------ | ----------- |
| id     | 계좌 식별자 |

#### Query

없음

#### Headers

| 헤더명        | 설명               |
| ------------- | ------------------ |
| Content-Type  | `application/json` |
| Authorization | `Bearer <token>`   |
| X-User-Id     | 사용자 ID          |

#### Request Body

없음

### 응답

#### 성공 (200)

```json
{
  "isSuccess": true,
  "code": 200,
  "message": "연동 계좌 조회를 완료했습니다.",
  "result": {
    "accountId": 2,
    "accountNumber": "111111-1111",
    "bankCode": 2,
    "bankName": "카카오뱅크",
    "accountAlias": "모임계좌",
    "isPrimaryAccount": true,
    "accountTypeCode": "예금",
    "balance": 10000
  }
}
```

---

## 5. 계좌 실명 조회

### 요청

#### API URL

```
POST {PORT}/api/accounts/openbank/verify-name
```

#### Path Variable

없음

#### Query

없음

#### Headers

| 헤더명        | 설명               |
| ------------- | ------------------ |
| Content-Type  | `application/json` |
| Authorization | `Bearer <token>`   |
| X-User-Id     | 사용자 ID          |

#### Request Body

| 항목          | 타입   | 필수 여부 | 설명                    | 비고               |
| ------------- | ------ | --------- | ----------------------- | ------------------ |
| accountNumber | String | Y         | 하이픈(-) 없는 계좌번호 | `"-"` 없이 전송    |
| bankCode      | int    | Y         | 은행 코드               | 연동된 은행 식별자 |

### 응답

#### 성공 (200)

```json
{
  "isSuccess": true,
  "code": 200,
  "message": "계좌 실명 조회가 완료되었습니다.",
  "result": {
    "username": "최지훈",
    "accountNumber": "111111111121212"
  }
}
```
