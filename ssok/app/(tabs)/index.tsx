import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { usePin } from '@/contexts/PinContext';

export default function HomeScreen() {
  const { isLoggedIn } = usePin();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>SSOK 쏙</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* 간단한 홈 컨텐츠 */}
      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>환영합니다!</Text>
          <Text style={styles.welcomeSubtitle}>
            SSOK 앱으로 쉽고 빠른 금융 서비스를 이용해보세요.
          </Text>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  settingsButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },
});
