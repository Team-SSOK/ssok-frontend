# Notification Module

이 모듈은 Expo Notifications를 사용하여 푸시 알림 기능을 제공합니다.

## 주요 기능

- 푸시 알림 권한 요청
- 디바이스 푸시 토큰 획득 (`getDevicePushTokenAsync` 사용)
- 서버에 토큰 등록
- 알림 수신 및 응답 처리
- Android 알림 채널 설정
- 에러 처리 및 사용자 친화적 메시지

## 설치 필요 패키지

```bash
npx expo install expo-notifications expo-device expo-constants
```

## 사용법

### 1. Splash 화면에서 자동 초기화

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useNotificationInitializer } from '@/modules/notification';

export default function SplashScreen() {
  const notification = useNotificationInitializer({
    autoRegister: true, // 자동으로 권한 요청 및 토큰 등록
    onSuccess: (token) => {
      console.log('푸시 토큰 등록 성공:', token);
    },
    onError: (error) => {
      console.error('푸시 알림 설정 오류:', error);
    },
    onNotificationReceived: (notification) => {
      console.log('알림 수신:', notification);
    },
    onNotificationResponse: (response) => {
      console.log('알림 탭:', response);
    },
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>앱 로딩 중...</Text>
      {notification.isLoading && <Text>푸시 알림 설정 중...</Text>}
      {notification.error && <Text>오류: {notification.error}</Text>}
    </View>
  );
}
```

### 2. 수동으로 푸시 알림 설정

```tsx
import React from 'react';
import { View, Button, Text } from 'react-native';
import { usePushNotifications } from '@/modules/notification';

export default function SettingsScreen() {
  const {
    pushToken,
    permissionStatus,
    isLoading,
    error,
    isTokenRegistered,
    requestPermissionsAndRegisterToken,
  } = usePushNotifications();

  const handleEnableNotifications = async () => {
    try {
      await requestPermissionsAndRegisterToken();
    } catch (error) {
      console.error('알림 설정 실패:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>권한 상태: {permissionStatus}</Text>
      <Text>토큰 등록됨: {isTokenRegistered ? '예' : '아니오'}</Text>
      {pushToken && <Text>푸시 토큰: {pushToken.substring(0, 20)}...</Text>}
      {error && <Text style={{ color: 'red' }}>오류: {error}</Text>}

      <Button
        title={isLoading ? '설정 중...' : '푸시 알림 활성화'}
        onPress={handleEnableNotifications}
        disabled={isLoading || isTokenRegistered}
      />
    </View>
  );
}
```

### 3. 알림 서비스 직접 사용

```tsx
import React, { useEffect } from 'react';
import {
  setupNotificationHandler,
  setupNotificationListeners,
  cleanupNotificationListeners,
  scheduleLocalNotification,
} from '@/modules/notification';

export default function NotificationExample() {
  useEffect(() => {
    // 알림 핸들러 설정
    setupNotificationHandler();

    // 알림 리스너 설정
    const listeners = setupNotificationListeners(
      (notification) => {
        console.log('알림 수신:', notification);
      },
      (response) => {
        console.log('알림 응답:', response);
      },
    );

    // 정리 - cleanupNotificationListeners 사용 또는 직접 remove() 호출
    return () => {
      cleanupNotificationListeners(listeners);
      // 또는 직접:
      // listeners.notificationListener?.remove();
      // listeners.responseListener?.remove();
    };
  }, []);

  const handleScheduleNotification = async () => {
    await scheduleLocalNotification(
      '테스트 알림',
      '이것은 테스트 알림입니다.',
      { customData: 'test' },
      5, // 5초 후
    );
  };

  return (
    <View>
      <Button title="5초 후 알림 예약" onPress={handleScheduleNotification} />
    </View>
  );
}
```

## API 참조

### Hooks

#### `usePushNotifications()`

푸시 알림 권한 요청 및 토큰 관리를 위한 기본 훅

**반환값:**

- `pushToken`: 디바이스 푸시 토큰
- `permissionStatus`: 권한 상태
- `isLoading`: 로딩 상태
- `error`: 에러 메시지
- `isTokenRegistered`: 토큰 등록 성공 여부
- `requestPermissionsAndRegisterToken()`: 권한 요청 및 토큰 등록 함수
- `checkPermissionStatus()`: 권한 상태 확인 함수
- `resetState()`: 상태 초기화 함수

#### `useNotificationInitializer(options)`

앱 시작 시 알림 초기화를 위한 고수준 훅

**옵션:**

- `autoRegister`: 자동 등록 여부 (기본값: true)
- `onError`: 에러 콜백
- `onSuccess`: 성공 콜백
- `onNotificationReceived`: 알림 수신 콜백
- `onNotificationResponse`: 알림 응답 콜백

### Services

#### `setupNotificationHandler()`

알림 핸들러 설정

#### `setupNotificationListeners(onReceived, onResponse)`

알림 리스너 설정

#### `cleanupNotificationListeners(listeners)`

알림 리스너 정리 (최신 API 사용)

**참고**: `removeNotificationSubscription`은 deprecated되었으므로 `subscription.remove()` 메서드를 사용합니다.

```tsx
// 자동 정리
cleanupNotificationListeners(listeners);

// 또는 수동 정리
listeners.notificationListener?.remove();
listeners.responseListener?.remove();
```

#### `scheduleLocalNotification(title, body, data, seconds)`

로컬 알림 스케줄링

### Utils

#### `isValidPushToken(token)`

푸시 토큰 유효성 검사

#### `getPermissionStatusMessage(status)`

권한 상태를 사용자 친화적 메시지로 변환

#### `getNotificationErrorMessage(error)`

에러를 사용자 친화적 메시지로 변환

## 주의사항

1. **물리적 디바이스 필요**: 푸시 알림은 실제 디바이스에서만 작동합니다.
2. **권한 요청**: iOS에서는 사용자가 권한을 거부하면 다시 요청할 수 없습니다.
3. **Android 채널**: Android에서는 알림 채널이 자동으로 설정됩니다.
4. **토큰 변경**: 디바이스 토큰은 앱 재설치, 백업 복원 등의 상황에서 변경될 수 있습니다.

## 문제 해결

### 토큰을 가져올 수 없는 경우

- 네트워크 연결 확인
- 실제 디바이스에서 테스트
- 앱 권한 설정 확인

### 알림이 표시되지 않는 경우

- 디바이스 알림 설정 확인
- 앱별 알림 권한 확인
- 방해 금지 모드 확인
