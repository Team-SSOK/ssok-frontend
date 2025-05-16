## Transfer API Specification

## 1. 일반 송금

### 개요

- 출금 계좌(본인 계좌)와 입금 계좌(상대 계좌)에 대한 정보, 은행 코드로 송금 요청
- 계좌 ID로 계좌 번호를 조회하고 계좌 번호와 은행 코드로 오픈 뱅킹에 요청
- 송금 금액으로 입/출금 진행

### 요청

#### API URL

```
POST {PORT}/api/transfers/openbank
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

| 항목              | 타입    | 필수 여부 | 설명                | 비고   |
| ----------------- | ------- | --------- | ------------------- | ------ |
| sendAccountId     | Long    | Y         | 출금 계좌 ID (본인) | 식별자 |
| sendBankCode      | Integer | Y         | 출금 은행 코드      |        |
| sendName          | String  | Y         | 출금자 이름 (본인)  |        |
| recvAccountNumber | String  | Y         | 입금 계좌 번호      |        |
| recvBankCode      | Integer | Y         | 입금 은행 코드      |        |
| recvName          | String  | Y         | 입금 상대방 이름    |        |
| amount            | Long    | Y         | 송금 금액           |        |

### 응답

#### 성공 (200)

```json
{
  "isSuccess": true,
  "code": 2000,
  "message": "송금에 성공했습니다.",
  "result": {
    "sendAccountId": 1,
    "recvAccountNumber": "111-1111-111",
    "recvName": "최지훈",
    "amount": 15000
  }
}
```

#### 실패

```json
{
  "isSuccess": false,
  "code": 4001,
  "message": "잔액이 부족합니다.",
  "result": null
}
```

---

## 2. 블루투스 송금

### 개요

- 출금 계좌(본인 주 계좌)와 입금 계좌(상대 주 계좌)에 대한 정보, 은행 코드로 송금 요청
- 계좌 ID로 본인 계좌, 상대 계좌 번호를 조회하고 계좌 번호와 은행 코드로 오픈 뱅킹에 요청
- 블루투스 송금 로직 재활용
  - TransferService.transfer 재활용
  - 상대방 userId로 계좌 서비스에서 recvAccountNumber, recvBankCode, recvName 조회
  - 조회된 정보로 TransferRequestDto 생성 후 transfer 호출
- 송금 금액으로 입/출금 진행

### 요청

#### API URL

```
POST {PORT}/api/transfers/openbank/bluetooth
```

#### Headers

| 헤더명        | 설명               |
| ------------- | ------------------ |
| Content-Type  | `application/json` |
| Authorization | `Bearer <token>`   |
| X-User-Id     | 사용자 ID          |

#### Request Body

| 항목          | 타입    | 필수 여부 | 설명           | 비고   |
| ------------- | ------- | --------- | -------------- | ------ |
| sendAccountId | Long    | Y         | 출금 계좌 ID   | 식별자 |
| sendBankCode  | Integer | Y         | 출금 은행 코드 |        |
| sendName      | String  | Y         | 출금자 이름    |        |
| recvUserId    | Long    | Y         | 입금 유저 ID   |        |
| amount        | Long    | Y         | 송금 금액      |        |

### 응답

#### 성공 (200)

```json
{
  "isSuccess": true,
  "code": 2000,
  "message": "블루투스 송금이 성공적으로 완료되었습니다.",
  "result": {
    "sendAccountId": 1,
    "recvName": "최*훈",
    "amount": 15000
  }
}
```

#### 실패

```json
{
  "isSuccess": false,
  "code": 4002,
  "message": "송금에 실패했습니다.",
  "result": null
}
```

---

## 3. 송금 내역 조회

### 개요

- 사용자의 계좌 ID를 기준으로 3개월 동안의 송금 내역을 조회
- 송금 내역은 TransferHistory 테이블 기준으로, 가장 최근에 생성된 순서(createdAt 기준 DESC)로 정렬되어 제공

### 요청

#### API URL

```
GET {PORT}/api/transfers/histories
```

#### 요청 PathVariable

없음

#### 요청 Query

| Query     | 설명        |
| --------- | ----------- |
| accountId | 계좌번호 ID |

#### 요청 Header

| 헤더명        | 설명               |
| ------------- | ------------------ |
| Content-Type  | `application/json` |
| Authorization | `Bearer <token>`   |

#### 요청 Body

없음

### 응답

#### 성공 (200)

```json
{
  "isSuccess": true,
  "code": 2000,
  "message": "송금 내역 조회를 완료했습니다.",
  "result": [
    {
      "transferId": 1,
      "transferType": "WITHDRAWAL",
      "transferMoney": 10000,
      "currencyCode": "KRW",
      "transferMethod": "GENERAL",
      "counterpartAccount": "1234-5678-9012",
      "counterpartName": "홍길동",
      "createdAt": "2024-05-01T12:30:00"
    },
    {
      "transferId": 2,
      "transferType": "DEPOSIT",
      "transferMoney": 5000,
      "currencyCode": "KRW",
      "transferMethod": "GENERAL",
      "counterpartAccount": "4321-8765-2109",
      "counterpartName": "김영희",
      "createdAt": "2024-04-28T15:45:00"
    }
  ]
}
```

#### 실패

```json
{
  "isSuccess": false,
  "code": 4001,
  "message": "계좌 ID는 필수입니다.",
  "result": null
}
```

---

## 4. 최근 송금 내역 조회

### 개요

- 사용자의 최근 송금 내역을 조회합니다.

### 요청

#### API URL

```
GET {PORT}/api/transfers/history
```

#### 요청 PathVariable

없음

#### 요청 Query

없음

#### 요청 Header

| 헤더명        | 설명                     |
| ------------- | ------------------------ |
| Content-Type  | `application/json`       |
| Authorization | `Bearer xxx` (추가 예정) |

#### 요청 Body

없음

---

## 응답

### 응답 Body

#### 1. 성공 케이스

```json
{
  "code": 200,
  "message": "최근 송금 내역 조회가 완료되었습니다.",
  "result": [
    {
      "transferId": 101,
      "transferType": "WITHDRAWAL",
      "counterpartName": "최지훈",
      "transferMoney": 150000,
      "currencyCode": "KRW",
      "transferMethod": "GENERAL",
      "createdAt": "2025-04-21T10:31:22"
    },
    {
      "transferId": 100,
      "transferType": "DEPOSIT",
      "counterpartName": "박도훈",
      "transferMoney": 50000,
      "currencyCode": "KRW",
      "transferMethod": "BLUETOOTH",
      "createdAt": "2025-04-20T15:12:10"
    }
  ]
}
```
