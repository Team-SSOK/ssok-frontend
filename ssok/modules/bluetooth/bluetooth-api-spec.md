# Bluetooth API Specification

## 1. UUID 등록

### 개요

- 프론트엔드에서 전달한 Bluetooth UUID를 백엔드 Redis에 캐싱
  - 양방향 인덱스 구조
    - Key: `uuid:{UUID}` → Value: `{userId}`
    - Key: `user:{userId}` → Value: `{UUID}`
  - 메모리 부담 및 성능 영향 고려
- UUID 변경 시 기존 매핑 삭제 후 재등록

### 요청

#### API URL

```
POST {PORT}/api/bluetooth/uuid
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

| 항목          | 타입   | 필수 여부 | 설명                         | 비고           |
| ------------- | ------ | --------- | ---------------------------- | -------------- |
| bluetoothUUID | String | Y         | 모바일 기기의 Bluetooth UUID | 변경될 수 있음 |

### 응답

#### 성공 (200)

```json
{
  "code": 2000,
  "message": "Bluetooth UUID가 정상적으로 등록되었습니다.",
  "result": {}
}
```

---

## 2. UUID 매칭 및 사용자 조회

### 개요

- 프론트엔드에서 모바일 기기의 블루투스 기능으로 주변 기기의 Bluetooth UUID 들을 탐색한 후, 이 UUID 리스트를 서버로 전송하면, 서버는 Redis에 등록된 UUID 목록과 비교하여 등록된 사용자 ID(보안 상 uuid 반환)와 정보(마스킹된 이름, 프로필 이미지 주소, 핸드폰 번호 뒷자리)를 반환
  - 이때 유저 정보에 대한 조회는 ssok-user-service에 내부 통신을 이용해서 조회
- 추가로 본인의 주 계좌 정보(주 계좌 번호, 은행코드, 잔액)도 조회해서 함께 반환

### 요청

#### API URL

```
POST {PORT}/api/bluetooth/match
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

| 항목          | 타입         | 필수 여부 | 설명                              |
| ------------- | ------------ | --------- | --------------------------------- |
| bluetoothUUID | List<String> | Y         | 탐색한 주변 Bluetooth UUID 리스트 |

### 응답

#### 성공 (200)

```json
{
  "code": 200,
  "message": "등록된 블루투스 UUID와 매칭된 유저 조회 성공",
  "result": {
    "users": [
      {
        "uuid": "abcdabcdabcd",
        "username": "최*훈",
        "phoneSuffix": "8812",
        "profileImage": "https://example.com/img/cjh.jpg"
      },
      {
        "uuid": "abcdabcdabcd",
        "username": "박*훈",
        "phoneSuffix": "1234",
        "profileImage": "https://example.com/img/pdh.jpg"
      }
    ],
    "primaryAccount": {
      "accountId": 1,
      "accountNumber": "110-1234-567890",
      "bankCode": 1,
      "balance": 1000000
    }
  }
}
```

---

## 3. 블루투스 송금

### 개요

- 상대방 uuid를 bluetooth service에서 매칭하고 transfer service로 송금 요청
- 출금 계좌(본인 주 계좌)와 입금 계좌(상대 주 계좌)에 대한 정보, 은행 코드로 송금 요청
- 계좌 ID로 본인 계좌, 상대 계좌 번호를 조회하고 계좌 번호와 은행 코드로 오픈 뱅킹에 요청
- 송금 금액으로 입/출금 진행

### 요청

#### API URL

```
POST {PORT}/api/bluetooth/transfers
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

#### Request Body

| 항목          | 타입    | 필수 여부 | 설명                | 비고   |
| ------------- | ------- | --------- | ------------------- | ------ |
| recvUuid      | String  | Y         | 입금 유저 uuid      |        |
| sendAccountId | Long    | Y         | 출금 계좌 ID (본인) | 식별자 |
| sendBankCode  | Integer | Y         | 출금 은행 코드      |        |
| sendName      | String  | Y         | 출금자 이름 (본인)  |        |
| amount        | Long    | Y         | 송금 금액           |        |

### 응답

#### 성공 (200)

```json
{
  "isSuccess": true,
  "code": 2400,
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
