import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { DiscoveredDevice } from '@/hooks/useBleScanner';
import { colors } from '@/constants/colors';
import PeerDeviceItem from './PeerDeviceItem';

interface PeerDeviceListProps {
  devices: DiscoveredDevice[];
  isScanning: boolean;
  onDevicePress?: (device: DiscoveredDevice) => void;
}

/**
 * 발견된 피어 디바이스 목록을 표시하는 컴포넌트
 */
const PeerDeviceList: React.FC<PeerDeviceListProps> = ({
  devices,
  isScanning,
  onDevicePress,
}) => {
  /**
   * 디바이스가 없을 때 표시할 빈 상태 컴포넌트
   */
  const renderEmptyComponent = () => {
    if (isScanning) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={styles.spinner}
          />
          <Text style={styles.emptyTitle}>기기 검색 중...</Text>
          <Text style={styles.emptySubtitle}>
            근처에 있는 블루투스 기기를 찾고 있습니다.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>발견된 기기가 없습니다</Text>
        <Text style={styles.emptySubtitle}>
          다른 기기가 근처에 있고 블루투스가 활성화되어 있는지 확인하세요.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>주변 기기</Text>
        {isScanning && (
          <ActivityIndicator color={colors.primary} size="small" />
        )}
      </View>

      <FlatList
        data={devices}
        renderItem={({ item }) => (
          <PeerDeviceItem device={item} onPress={onDevicePress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  spinner: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PeerDeviceList;
