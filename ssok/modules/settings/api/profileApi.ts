import ApiInstance from '@/api/ApiInstance';

/**
 * API 응답 타입
 */
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  code: string | number;
  message: string;
  result?: T;
}

/**
 * 프로필 이미지 업로드 응답 타입
 */
export interface ProfileImageUploadResponse {
  id: number;
  url: string;
  contentType: string;
}

/**
 * 프로필 이미지 업로드 API
 *
 * @param file - 업로드할 이미지 파일 (FormData)
 * @param userId - 사용자 ID
 * @returns 업로드된 이미지 정보
 */
export const uploadProfileImage = async (
  file: FormData,
  userId: number,
): Promise<ApiResponse<ProfileImageUploadResponse>> => {
  const response = await ApiInstance.post<
    ApiResponse<ProfileImageUploadResponse>
  >('/api/profiles', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-User-Id': userId.toString(),
    },
  });

  return response.data;
};

/**
 * 프로필 이미지 삭제 API
 *
 * @param userId - 사용자 ID
 * @returns 삭제 결과
 */
export const deleteProfileImage = async (
  userId: number,
): Promise<ApiResponse<null>> => {
  const response = await ApiInstance.delete<ApiResponse<null>>(
    '/api/profiles',
    {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString(),
      },
    },
  );

  return response.data;
};
