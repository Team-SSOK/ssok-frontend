import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightComponent?: ReactNode;
  iconColor?: string;
  borderBottom?: boolean;
  textColor?: string;
};

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  onPress,
  rightComponent,
  iconColor = colors.black,
  borderBottom = true,
  textColor = colors.black,
}) => {
  return (
    <TouchableOpacity
      style={[styles.settingItem, !borderBottom && { borderBottomWidth: 0 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text style={[styles.settingText, { color: textColor }]}>{label}</Text>
      </View>
      {rightComponent ||
        (onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.grey} />
        ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  },
});
