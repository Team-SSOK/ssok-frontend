import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface HeaderProps {
  title: string;
}

const SignInHeader: React.FC<HeaderProps> = ({ title }) => {

  return (
    <View style={styles.header}>
      <Text style={[typography.h2, styles.headerTitle]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 10,
  },
  headerTitle: {
    color: colors.primary,
  },
  rightPlaceholder: {
    width: 32,
  },
});

export default SignInHeader;
