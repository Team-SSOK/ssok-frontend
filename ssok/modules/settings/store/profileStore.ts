import { create } from 'zustand';
import { profileApi } from '@/modules/settings/api';
import { useAuthStore } from '@/modules/auth/store/authStore';

interface ProfileState {
  // 상태
  username: string;
  phoneNumber: string;
  profileImage: string | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchProfile: (userId: number) => Promise<void>;
  setProfileImage: (imageUrl: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  // 초기 상태
  username: '',
  phoneNumber: '',
  profileImage: null,
  isLoading: false,
  error: null,

  // 액션
  fetchProfile: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getUserInfo(userId);
      const data = response.data;

      if (data.isSuccess && data.result) {
        const profileImage =
          data.result.profileImage && data.result.profileImage !== 'noUrl'
            ? data.result.profileImage
            : null;

        set({
          username: data.result.username,
          phoneNumber: data.result.phoneNumber,
          profileImage: profileImage,
          isLoading: false,
        });
      } else {
        set({
          error: data.message || '프로필 정보를 불러오는데 실패했습니다.',
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.log('[ProfileStore] fetchProfile error:', error);

      // 사용자 없음 에러 감지 (다양한 케이스 포함)
      const isUserNotFoundError = 
        error.response?.status === 404 ||
        error.response?.data?.code === 4040 ||
        error.response?.data?.code === 5011 || // 서버에서 사용자 정보 삭제됨
        error.response?.data?.message?.includes('사용자를 찾을 수 없습니다') ||
        error.response?.data?.message?.includes('User not found');

      if (isUserNotFoundError) {
        console.log('[ProfileStore] 사용자 없음 에러 감지 - 전체 초기화 진행');

        // 사용자 데이터 완전 초기화 및 sign-in으로 리다이렉트
        const authStore = useAuthStore.getState();
        await authStore.handleUserNotFound();
        return;
      }

      set({
        error: '프로필 정보를 불러오는데 오류가 발생했습니다.',
        isLoading: false,
      });
    }
  },

  setProfileImage: (imageUrl: string | null) => set({ profileImage: imageUrl }),

  reset: () =>
    set({
      username: '',
      phoneNumber: '',
      profileImage: null,
      isLoading: false,
      error: null,
    }),
}));
