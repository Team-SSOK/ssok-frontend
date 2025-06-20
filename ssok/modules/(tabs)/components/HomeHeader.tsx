import React from 'react';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
  onSettingsPress?: () => void;
}

export default function HomeHeader({ onSettingsPress }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Image
          source={require('@/assets/images/app-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Pressable style={styles.settingsButton} onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={24} color={colors.black} />
      </Pressable>
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
  logo: {
    width: 80,
    height: 35,
  },
  settingsButton: {
    padding: 5,
  },
});
