import React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';
import { useLoadingStore } from '@/stores/loadingStore';
import { Text } from '@/components/TextProvider';

interface NoAccountsStateProps {
  onRegisterPress: () => void;
}

export default function NoAccountsState({
  onRegisterPress,
}: NoAccountsStateProps) {
  const { isLoading, withLoading } = useLoadingStore();

  const handlePress = async () => {
    await withLoading(async () => {
      // 2초 지연
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 지연 후 실행
      onRegisterPress();
    });
  };

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>연동된 계좌가 없습니다</Text>
      <Button
        title={isLoading ? '로딩 중...' : '계좌 연동하기'}
        onPress={handlePress}
        style={styles.registerButton}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 24,
  },
  registerButton: {
    width: '80%',
  },
  loading: {
    marginTop: 16,
  },
});
