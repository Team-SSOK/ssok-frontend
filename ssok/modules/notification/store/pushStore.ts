import { create } from 'zustand';
import * as Notifications from 'expo-notifications';

export interface PushNotificationState {
  pushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  isTokenRegistered: boolean;
  isLoading: boolean;
  error: string | null;
}

interface PushNotificationActions {
  setState: (partialState: Partial<PushNotificationState>) => void;
  resetState: () => void;
}

export const usePushStore = create<
  PushNotificationState & PushNotificationActions
>((set) => ({
  // Initial State
  pushToken: null,
  permissionStatus: null,
  isTokenRegistered: false,
  isLoading: false,
  error: null,

  // Actions
  setState: (partialState) => set((state) => ({ ...state, ...partialState })),
  resetState: () =>
    set({
      pushToken: null,
      permissionStatus: null,
      isTokenRegistered: false,
      isLoading: false,
      error: null,
    }),
})); 