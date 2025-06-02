import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface AddAccountCardProps {
  onPress: () => void;
}

export default function AddAccountCard({ onPress }: AddAccountCardProps) {
  return (
    <Pressable style={styles.addAccountCard} onPress={onPress}>
      <View style={styles.addAccountContent}>
        <View style={styles.addIconContainer}>
          <Text style={styles.addIcon}>+</Text>
        </View>
        <Text style={[typography.body1, styles.addAccountText]}>
          계좌 추가 연동
        </Text>
        <Text style={[typography.caption, styles.addAccountSubtext]}>
          새로운 계좌를 연결해보세요
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addAccountCard: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
  },
  addAccountContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addIcon: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  addAccountText: {
    color: colors.primary,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  addAccountSubtext: {
    color: colors.mGrey,
    textAlign: 'center',
  },
}); 