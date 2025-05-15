import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

// 프로필 이미지 컴포넌트
type ProfileImageProps = {
  onEditPress?: () => void;
  imageUrl?: string | null;
};

export const ProfileImage: React.FC<ProfileImageProps> = ({
  onEditPress,
  imageUrl,
}) => {
  return (
    <View style={styles.profileImageContainer}>
      <View style={styles.profileImage}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Ionicons name="person" size={50} color={colors.white} />
        )}
      </View>
      {onEditPress && (
        <TouchableOpacity style={styles.editImageButton} onPress={onEditPress}>
          <Ionicons name="camera" size={20} color={colors.white} />
        </TouchableOpacity>
      )}
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
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
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
});
