import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';
import { shortenUUID } from '@/utils/ble';

interface BleStatusCardProps {
  isAdvertising: boolean;
  isScanning: boolean;
  uuid: string;
  onStartAdvertising?: () => void;
  onStopAdvertising?: () => void;
  onStartScanning?: () => void;
  onStopScanning?: () => void;
}

/**
 * BLE 광고 및 스캔 상태를 표시하는 카드 컴포넌트
 */
const BleStatusCard: React.FC<BleStatusCardProps> = ({
  isAdvertising,
  isScanning,
  uuid,
  onStartAdvertising,
  onStopAdvertising,
  onStartScanning,
  onStopScanning,
}) => {
  // UUID 간소화
  const shortUuid = shortenUUID(uuid);

  // 기기 정보
  const deviceInfo = Platform.OS === 'android' ? 'Android' : 'iOS';
  const deviceVersion = Platform.Version;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>블루투스 상태</Text>
        <Text style={styles.deviceInfo}>
          {deviceInfo} {deviceVersion}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>내 UUID:</Text>
          <View style={styles.uuidContainer}>
            <Text
              style={styles.uuidText}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {uuid}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>광고</Text>
              <View
                style={[
                  styles.statusIndicator,
                  isAdvertising
                    ? styles.activeIndicator
                    : styles.inactiveIndicator,
                ]}
              />
            </View>
            <Text style={styles.statusValue}>
              {isAdvertising ? '활성화됨' : '비활성화됨'}
            </Text>
            {/* Android에서만 광고 버튼 표시 */}
            {Platform.OS === 'android' && (
              <Pressable
                style={[
                  styles.actionButton,
                  isAdvertising ? styles.stopButton : styles.startButton,
                ]}
                onPress={isAdvertising ? onStopAdvertising : onStartAdvertising}
              >
                <Text style={styles.actionButtonText}>
                  {isAdvertising ? '중지' : '시작'}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.statusItem}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>스캔</Text>
              <View
                style={[
                  styles.statusIndicator,
                  isScanning
                    ? styles.activeIndicator
                    : styles.inactiveIndicator,
                ]}
              />
            </View>
            <Text style={styles.statusValue}>
              {isScanning ? '스캔 중...' : '대기 중'}
            </Text>
            <Pressable
              style={[
                styles.actionButton,
                isScanning ? styles.stopButton : styles.startButton,
              ]}
              onPress={isScanning ? onStopScanning : onStartScanning}
            >
              <Text style={styles.actionButtonText}>
                {isScanning ? '중지' : '시작'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {Platform.OS === 'android'
            ? '광고와 스캔이 동시에 가능합니다'
            : 'iOS에서는 광고 기능이 제한됩니다'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  deviceInfo: {
    fontSize: 12,
    color: colors.grey,
  },
  content: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginRight: 8,
    width: 70,
  },
  uuidContainer: {
    flex: 1,
    backgroundColor: colors.silver,
    padding: 8,
    borderRadius: 4,
  },
  uuidText: {
    fontSize: 12,
    color: colors.grey,
    fontFamily: 'monospace',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  activeIndicator: {
    backgroundColor: colors.success,
  },
  inactiveIndicator: {
    backgroundColor: colors.grey,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  statusValue: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 8,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.silver,
    marginHorizontal: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.silver,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
  },
});

export default BleStatusCard;
