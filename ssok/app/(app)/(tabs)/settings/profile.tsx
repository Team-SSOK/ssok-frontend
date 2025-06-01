import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Section, ProfileImage, InfoItem } from '@/modules/settings';
import Header from '@/components/CommonHeader';
import { useProfileStore } from '@/modules/settings/store/profileStore';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const userId = useAuthStore((state) => state.user?.id);
  const {
    username,
    phoneNumber,
    profileImage,
    isLoading,
    error,
    fetchProfile,
  } = useProfileStore();

  const refreshProfile = useCallback(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  if (isLoading && !profileImage && !username) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="내 프로필" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="내 프로필" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="내 프로필" />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshProfile}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.profileHeader}>
          <ProfileImage imageUrl={profileImage} />
        </View>

        <Section title="개인 정보">
          <InfoItem
            label="이름"
            value={username || '-'}
            icon={<Ionicons name="person" size={20} color={colors.primary} />}
          />
          <InfoItem
            label="전화번호"
            value={phoneNumber || '-'}
            icon={<Ionicons name="call" size={20} color={colors.primary} />}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: colors.black,
  },
  profileSubtitle: {
    fontSize: 16,
    color: colors.grey,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
});
