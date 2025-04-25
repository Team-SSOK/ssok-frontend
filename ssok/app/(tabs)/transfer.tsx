import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function TransferScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>블루투스 송금</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 송금 서비스 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>송금 서비스</Text>
          <View style={styles.serviceGrid}>
            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={colors.white}
                />
              </View>
              <Text style={styles.serviceName}>친구에게 송금</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={colors.white}
                />
              </View>
              <Text style={styles.serviceName}>계좌 이체</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons name="globe-outline" size={24} color={colors.white} />
              </View>
              <Text style={styles.serviceName}>해외 송금</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 금융 서비스 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>금융 서비스</Text>
          <View style={styles.serviceGrid}>
            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons name="card-outline" size={24} color={colors.white} />
              </View>
              <Text style={styles.serviceName}>카드 관리</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={24}
                  color={colors.white}
                />
              </View>
              <Text style={styles.serviceName}>자산 관리</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color={colors.white}
                />
              </View>
              <Text style={styles.serviceName}>청구서 결제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.black,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.black,
  },
});
