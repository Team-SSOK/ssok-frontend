import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { usePin } from '@/contexts/PinContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { logout } = usePin();
  const [notifications, setNotifications] = React.useState(true);
  const [biometrics, setBiometrics] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 계정 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 설정</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={24} color={colors.black} />
              <Text style={styles.settingText}>내 프로필</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={colors.black}
              />
              <Text style={styles.settingText}>PIN 번호 변경</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>

        {/* 앱 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.black}
              />
              <Text style={styles.settingText}>알림 설정</Text>
            </View>
            <Switch
              trackColor={{ false: colors.silver, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.silver}
              onValueChange={setNotifications}
              value={notifications}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="finger-print-outline"
                size={24}
                color={colors.black}
              />
              <Text style={styles.settingText}>생체인증 사용</Text>
            </View>
            <Switch
              trackColor={{ false: colors.silver, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.silver}
              onValueChange={setBiometrics}
              value={biometrics}
            />
          </View>
        </View>

        {/* 지원 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.black}
              />
              <Text style={styles.settingText}>도움말</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="call-outline" size={24} color={colors.black} />
              <Text style={styles.settingText}>고객센터</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>

        {/* 로그아웃 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.black,
  },
  logoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
