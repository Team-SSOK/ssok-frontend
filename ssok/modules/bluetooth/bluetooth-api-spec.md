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

| 헤더명        | 설명                       |
| ------------- | -------------------------- |
| Content-Type  | `application/json`         |
| Authorization | `Bearer <token>`           |
| X-User-Id     | 사용자 ID                  |

#### Request Body

| 항목            | 타입   | 필수 여부 | 설명                         | 비고              |
| --------------- | ------ | --------- | ---------------------------- | ----------------- |
| bluetoothUUID   | String | Y         | 모바일 기기의 Bluetooth UUID | 변경될 수 있음    |

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

- 클라이언트가 탐색한 주변 Bluetooth UUID 리스트를 서버에 전송
- 서버는 Redis에 등록된 UUID와 비교하여 매칭된 사용자 정보(마스킹된 이름, 프로필 이미지) 반환
- 추가로 본인의 주 계좌 정보(계좌 번호, 은행 코드, 잔액)도 함께 반환

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

| 헤더명        | 설명                       |
| ------------- | -------------------------- |
| Content-Type  | `application/json`         |
| Authorization | `Bearer <token>`           |
| X-User-Id     | 사용자 ID                  |

#### Request Body

| 항목            | 타입              | 필수 여부 | 설명                             |
| --------------- | ----------------- | --------- | -------------------------------- |
| bluetoothUUID   | List<String>      | Y         | 탐색한 주변 Bluetooth UUID 리스트 |

### 응답

#### 성공 (200)

```json
{
  "code": 200,
  "message": "등록된 블루투스 UUID와 매칭된 유저 조회 성공",
  "result": {
    "users": [
      {
        "userId": 101,
        "username": "최*훈",
        "profileImage": "https://example.com/img/cjh.jpg"
      },
      {
        "userId": 202,
        "username": "박*훈",
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
