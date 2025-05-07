import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { Section, ProfileImage, InfoItem } from '@/modules/settings';
import Header from '@/components/Header';

export default function ProfileScreen() {
  const profileData = {
    name: '박재홍',
    phone: '010-3360-4104',
  };

  // 프로필 이미지 수정 처리
  const handleEditImage = () => {
    // 이미지 수정 로직 (추후 구현)
    console.log('프로필 이미지 수정');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <Header title="내 프로필" />

      <ScrollView style={styles.content}>
        {/* 프로필 이미지 섹션 */}
        <ProfileImage onEditPress={handleEditImage} />

        {/* 프로필 정보 섹션 */}
        <Section title="개인 정보">
          <InfoItem label="이름" value={profileData.name} />
          <InfoItem label="전화번호" value={profileData.phone} />
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
});
