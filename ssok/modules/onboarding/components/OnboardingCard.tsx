import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { OnboardingCardData } from '../utils/types';
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

interface OnboardingCardProps extends OnboardingCardData {
  buttonText?: string;
  containerStyle?: ViewStyle;
  active?: boolean;
}

const windowWidth = Dimensions.get('window').width;

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  iconName,
  iconColor,
  backgroundColor,
  onPress,
  buttonText,
  containerStyle,
  active = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || colors.white },
        active ? styles.activeContainer : {},
        containerStyle,
      ]}
    >
      <View style={styles.contentContainer}>
        {iconName && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={iconName as any}
              size={24}
              color={iconColor || colors.primary}
            />
          </View>
        )}
        <Text style={[typography.h2, styles.title]}>{title}</Text>
        <Text style={[typography.body1, styles.description]}>
          {description}
        </Text>
      </View>

      {buttonText && onPress && (
        <TouchableOpacity
          style={[styles.button, active ? styles.activeButton : {}]}
          onPress={onPress}
        >
          <Text
            style={[styles.buttonText, active ? styles.activeButtonText : {}]}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: windowWidth - 48,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 10,
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  contentContainer: {
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.black,
  },
  description: {
    fontSize: 14,
    color: colors.grey,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.silver,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontWeight: '600',
    color: colors.mGrey,
  },
  activeButtonText: {
    color: colors.white,
  },
});

export default OnboardingCard;
