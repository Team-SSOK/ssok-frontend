import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface AccountHeaderProps {
  onSettingsPress?: () => void;
}

export default function AccountHeader({ onSettingsPress }: AccountHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>SSOK 쏙</Text>
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
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  settingsButton: {
    padding: 5,
  },
});
