import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
}) => {
  return (
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
      ) : (
        <View style={styles.emptySpace} />
      )}
      <Text style={[typography.h3, styles.title]}>{title}</Text>
      <View style={styles.rightSpace} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  emptySpace: {
    width: 34, // 아이콘 크기 + 패딩
  },
  rightSpace: {
    width: 34,
  },
  title: {
    color: colors.black,
  },
});
