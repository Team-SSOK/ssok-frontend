# Transfer API Specification

## 개요

- 출금 계좌(본인 계좌)와 입금 계좌(상대 계좌)에 대한 정보, 은행 코드로 송금 요청  
- 계좌 ID로 계좌 번호를 조회하고 계좌 번호와 은행 코드로 오픈 뱅킹에 요청  
- 송금 금액으로 입/출금 진행  

## 요청

### API URL

```
POST {PORT}/api/transfers/openbank
```

### Path Variable

없음

### Query

없음

### Headers

| 헤더명         | 설명                         |
| -------------- | ---------------------------- |
| Content-Type   | `application/json`           |
| Authorization  | `Bearer <token>`             |
| X-User-Id      | 사용자 ID                    |

### Request Body

| 항목                 | 타입     | 필수 여부 | 설명                          | 비고     |
| -------------------- | -------- | --------- | ----------------------------- | -------- |
| sendAccountId        | Long     | Y         | 출금 계좌 ID (본인)           | 식별자   |
| sendBankCode         | Integer  | Y         | 출금 은행 코드                |          |
| sendName             | String   | Y         | 출금자 이름 (본인)            |          |
| recvAccountNumber    | String   | Y         | 입금 계좌 번호                |          |
| recvBankCode         | Integer  | Y         | 입금 은행 코드                |          |
| recvName             | String   | Y         | 입금 상대방 이름              |          |
| amount               | Long     | Y         | 송금 금액                     |          |

## 응답

### 성공 (200)

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

### 실패

```json
{
  "isSuccess": false,
  "code": 4001,
  "message": "잔액이 부족합니다.",
  "result": null
}
```  
