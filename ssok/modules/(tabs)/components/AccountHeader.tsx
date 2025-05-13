import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface AccountHeaderProps {
  onSettingsPress?: () => void;
}

export default function AccountHeader({ onSettingsPress }: AccountHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={24} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: colors.primary,
  },
  logo: {
    width: 80,
    height: 35,
  },
  settingsButton: {
    padding: 5,
  },
});
