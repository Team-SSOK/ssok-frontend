import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useProfileImageManager } from '../hooks/useProfileImageManager';

// 프로필 이미지 컴포넌트
type ProfileImageProps = {
  imageUrl?: string | null;
};

export const ProfileImage: React.FC<ProfileImageProps> = ({ imageUrl }) => {
  const { isUploading, showImageOptions } = useProfileImageManager({
    imagePickerOptions: {
      quality: 0.8,
      aspect: [1, 1],
      allowsEditing: true,
    },
  });

  console.log('imageUrl', imageUrl);

  return (
    <View style={styles.profileImageContainer}>
      <Pressable
        style={styles.profileImage}
        onPress={() => showImageOptions(!!imageUrl)}
        disabled={isUploading}
      >
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : require('@/assets/images/profile.webp')
          }
          style={styles.image}
        />
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <Ionicons name="cloud-upload" size={30} color={colors.white} />
          </View>
        )}
      </Pressable>
    </View>
  );
};

// 개인 정보 항목 컴포넌트
type InfoItemProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoLabelContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoValueContainer}>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

// 설정 섹션 컴포넌트
type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.grey,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    color: colors.black,
    marginRight: 10,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
