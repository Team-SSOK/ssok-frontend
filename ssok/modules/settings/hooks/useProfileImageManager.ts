import { useState } from 'react';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage, deleteProfileImage } from '../api/profileApi';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useProfileStore } from '../store/profileStore';

/**
 * 이미지 선택 옵션 타입
 */
export interface ImagePickerOptions {
  quality?: number;
  aspect?: [number, number];
  allowsEditing?: boolean;
}

/**
 * 프로필 이미지 관리 훅 옵션
 */
export interface UseProfileImageManagerOptions {
  imagePickerOptions?: ImagePickerOptions;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: string) => void;
}

/**
 * 프로필 이미지 관리 훅
 *
 * 이미지 선택, 업로드, 삭제 등의 모든 로직을 관리합니다.
 */
export const useProfileImageManager = (
  options: UseProfileImageManagerOptions = {},
) => {
  const [isUploading, setIsUploading] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const { setProfileImage } = useProfileStore();

  const {
    imagePickerOptions = {
      quality: 0.8,
      aspect: [1, 1],
      allowsEditing: true,
    },
    onUploadSuccess,
    onUploadError,
    onDeleteSuccess,
    onDeleteError,
  } = options;

  /**
   * 미디어 라이브러리 권한 요청 및 이미지 선택
   */
  const selectFromLibrary = async () => {
    try {
      // 권한 요청
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: imagePickerOptions.allowsEditing,
        aspect: imagePickerOptions.aspect,
        quality: imagePickerOptions.quality,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      const errorMessage = '이미지 선택 중 오류가 발생했습니다.';
      onUploadError?.(errorMessage) || Alert.alert('오류', errorMessage);
    }
  };

  /**
   * 카메라 권한 요청 및 사진 촬영
   */
  const takePhoto = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
        return;
      }

      // 사진 촬영
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: imagePickerOptions.allowsEditing,
        aspect: imagePickerOptions.aspect,
        quality: imagePickerOptions.quality,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('카메라 촬영 오류:', error);
      const errorMessage = '사진 촬영 중 오류가 발생했습니다.';
      onUploadError?.(errorMessage) || Alert.alert('오류', errorMessage);
    }
  };

  /**
   * 이미지 업로드 처리
   */
  const uploadImage = async (uri: string) => {
    if (!userId) {
      const errorMessage = '사용자 정보를 찾을 수 없습니다.';
      onUploadError?.(errorMessage) || Alert.alert('오류', errorMessage);
      return;
    }

    setIsUploading(true);
    try {
      // FormData 생성
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      // API 호출
      const response = await uploadProfileImage(formData, userId);

      if (response.isSuccess && response.result) {
        setProfileImage(response.result.url);
        onUploadSuccess?.(response.result.url) ||
          Alert.alert('성공', '프로필 이미지가 업데이트되었습니다.');
      } else {
        throw new Error(response.message || '업로드에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('이미지 업로드 오류:', error);
      const errorMessage = error.message || '이미지 업로드에 실패했습니다.';
      onUploadError?.(errorMessage) || Alert.alert('오류', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 프로필 이미지 삭제
   */
  const deleteImage = async () => {
    if (!userId) {
      const errorMessage = '사용자 정보를 찾을 수 없습니다.';
      onDeleteError?.(errorMessage) || Alert.alert('오류', errorMessage);
      return;
    }

    Alert.alert('이미지 삭제', '프로필 이미지를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await deleteProfileImage(userId);
            if (response.isSuccess) {
              setProfileImage(null);
              onDeleteSuccess?.() ||
                Alert.alert('성공', '프로필 이미지가 삭제되었습니다.');
            } else {
              throw new Error(response.message || '삭제에 실패했습니다.');
            }
          } catch (error: any) {
            console.error('이미지 삭제 오류:', error);
            const errorMessage = error.message || '이미지 삭제에 실패했습니다.';
            onDeleteError?.(errorMessage) || Alert.alert('오류', errorMessage);
          }
        },
      },
    ]);
  };

  /**
   * 이미지 옵션 선택 UI 표시
   */
  const showImageOptions = (hasImage: boolean = false) => {
    const options = ['사진 라이브러리', '카메라'];
    if (hasImage) {
      options.push('이미지 삭제');
    }
    options.push('취소');

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: hasImage ? 2 : undefined,
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              selectFromLibrary();
              break;
            case 1:
              takePhoto();
              break;
            case 2:
              if (hasImage) deleteImage();
              break;
          }
        },
      );
    } else {
      // Android용 Alert
      Alert.alert('프로필 이미지', '원하는 옵션을 선택하세요.', [
        { text: '사진 라이브러리', onPress: selectFromLibrary },
        { text: '카메라', onPress: takePhoto },
        ...(hasImage ? [{ text: '이미지 삭제', onPress: deleteImage }] : []),
        { text: '취소', style: 'cancel' as const },
      ]);
    }
  };

  return {
    // 상태
    isUploading,

    // 메서드
    selectFromLibrary,
    takePhoto,
    deleteImage,
    showImageOptions,
  };
};
