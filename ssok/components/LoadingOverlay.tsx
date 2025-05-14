import React from 'react';
import { StyleSheet, View, ActivityIndicator, Modal } from 'react-native';
import { colors } from '@/constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  transparent?: boolean;
}

/**
 * 전체 화면을 덮는 로딩 오버레이 컴포넌트
 * 사용자 상호작용을 방지하고 로딩 상태를 표시합니다.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  transparent = true,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={transparent}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  loaderContainer: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default LoadingOverlay;
