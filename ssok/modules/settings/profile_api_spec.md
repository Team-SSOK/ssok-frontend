# Profile API

## 1. 사용자 기본 정보 조회

- **URL**: `GET /api/users/info`
- **Headers**

  | 헤더명    | 필수 여부 | 설명                         |
  | --------- | --------- | ---------------------------- |
  | X-User-Id | Y         | Gateway에서 전달한 사용자 ID |

- **Response (200 OK)**

  ```json
  {
    "success": true,
    "code": 2000,
    "message": "요청에 성공하였습니다.",
    "data": {
      "username": "홍길동",
      "phoneNumber": "01012345678",
      "profileImage": "https://ssok-storage.example.com/profiles/user123.jpg"
    }
  }
  ```

  - `profileImage`가 없으면 `null` 반환

- **Error Responses**
  - **401 Unauthorized** (헤더 누락/유효하지 않은 토큰)
    ```json
    {
      "success": false,
      "code": 4010,
      "message": "유효하지 않은 토큰입니다.",
      "data": null
    }
    ```
  - **404 Not Found** (사용자 없음)
    ```json
    {
      "success": false,
      "code": 5000,
      "message": "사용자를 찾을 수 없습니다.",
      "data": null
    }
    ```
