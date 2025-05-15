import { create } from 'zustand';
import { profileApi } from '@/modules/settings/api';

interface ProfileState {
  // 상태
  username: string;
  phoneNumber: string;
  profileImage: string | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchProfile: (userId: number) => Promise<void>;
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
    } catch (error) {
      set({
        error: '프로필 정보를 불러오는데 오류가 발생했습니다.',
        isLoading: false,
      });
    }
  },

  reset: () =>
    set({
      username: '',
      phoneNumber: '',
      profileImage: null,
      isLoading: false,
      error: null,
    }),
}));
