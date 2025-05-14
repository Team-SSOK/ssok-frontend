# Profile API

## 1. 사용자 기본 정보 조회

- **URL**: `GET /api/users/info`  
- **Headers**

  | 헤더명      | 필수 여부 | 설명                                |
  | ----------- | --------- | ----------------------------------- |
  | X-User-Id   | Y         | Gateway에서 전달한 사용자 ID        |

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

---

## 2. 프로필 사진 등록

- **URL**: `POST /api/profiles`  
- **Headers**

  | 헤더명         | 설명                    |
  | -------------- | ----------------------- |
  | Content-Type   | `multipart/form-data`   |
  | Authorization  | `Bearer <token>` (추후) |
  | X-User-Id      | 유저 ID                 |

- **Request Body** (`form-data`)

  | 필드         | 타입       | 필수 여부 | 설명             |
  | ------------ | ---------- | --------- | ---------------- |
  | profileImage | `file`     | Y         | 업로드할 이미지  |

- **Response (201 Created)**  
  ```json
  {
    "isSuccess": true,
    "code": 201,
    "message": "프로필 사진 등록을 완료했습니다."
  }
  ```

- **Error Cases**  
  - 유효하지 않은 `X-User-Id` 등:  
    ```json
    {
      "isSuccess": false,
      "code": <error_code>,
      "message": "<error_message>"
    }
    ```

---

## 3. 프로필 사진 수정

- **URL**: `PATCH /api/profiles`  
- **Headers**

  | 헤더명         | 설명                    |
  | -------------- | ----------------------- |
  | Content-Type   | `multipart/form-data`   |
  | Authorization  | `Bearer <token>` (추후) |
  | X-User-Id      | 유저 ID                 |

- **Request Body** (`form-data`)

  | 필드         | 타입       | 필수 여부 | 설명             |
  | ------------ | ---------- | --------- | ---------------- |
  | profileImage | `file`     | Y         | 새 이미지 파일   |

- **Response (200 OK)**  
  ```json
  {
    "isSuccess": true,
    "code": 201,
    "message": "프로필 사진 수정을 완료했습니다."
  }
  ```

- **Error Cases**  
  - 유효하지 않은 `X-User-Id` 등:  
    ```json
    {
      "isSuccess": false,
      "code": <error_code>,
      "message": "<error_message>"
    }
    ```

---

## 4. 프로필 사진 삭제

- **URL**: `DELETE /api/profiles`  
- **Headers**

  | 헤더명         | 설명                    |
  | -------------- | ----------------------- |
  | Content-Type   | `application/json`      |
  | Authorization  | `Bearer <token>` (추후) |
  | X-User-Id      | 유저 ID                 |

- **Request Body**: 없음

- **Response (200 OK)**  
  ```json
  {
    "isSuccess": true,
    "code": 200,
    "message": "프로필 사진 삭제를 완료했습니다."
  }
  ```

- **Error Cases**  
  - 유효하지 않은 `X-User-Id` 등:  
    ```json
    {
      "isSuccess": false,
      "code": <error_code>,
      "message": "<error_message>"
    }
    ```
